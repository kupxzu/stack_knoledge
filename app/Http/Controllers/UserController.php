<?php

namespace App\Http\Controllers;

use App\Models\LoginLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'login' => 'required|string',
                'password' => 'required|string',
                'remember' => 'boolean',
            ]);

            $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
            
            $user = User::where($loginField, $request->login)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'login' => ['The provided credentials are incorrect.'],
                ]);
            }

            $tokenName = $request->remember ? 'remember_token' : 'access_token';
            $token = $user->createToken($tokenName, ['*'], $request->remember ? now()->addDays(30) : now()->addHours(24));

            LoginLog::create([
                'user_id' => $user->id,
                'login_type' => $loginField,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'login_at' => now(),
            ]);

            return response()->json([
                'user' => $user,
                'token' => $token->plainTextToken,
                'expires_at' => $token->accessToken->expires_at,
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['error' => 'Login failed'], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Logged out successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Logout failed'], 500);
        }
    }

    public function logoutAll(Request $request)
    {
        try {
            $request->user()->tokens()->delete();
            return response()->json(['message' => 'Logged out from all devices']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Logout failed'], 500);
        }
    }

    public function profile(Request $request)
    {
        try {
            return response()->json(['user' => $request->user()]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch profile'], 500);
        }
    }

    public function forgotPassword(Request $request)
    {
        try {
            $request->validate(['email' => 'required|email']);

            $status = Password::sendResetLink($request->only('email'));

            if ($status !== Password::RESET_LINK_SENT) {
                throw ValidationException::withMessages([
                    'email' => [__($status)],
                ]);
            }

            return response()->json(['message' => __($status)]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to send reset link'], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required',
                'email' => 'required|email',
                'password' => 'required|min:8|confirmed',
            ]);

            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function (User $user, string $password) {
                    $user->forceFill([
                        'password' => Hash::make($password)
                    ]);
                    $user->save();
                }
            );

            if ($status !== Password::PASSWORD_RESET) {
                throw ValidationException::withMessages([
                    'email' => [__($status)],
                ]);
            }

            return response()->json(['message' => __($status)]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['error' => 'Password reset failed'], 500);
        }
    }

    public function loginHistory(Request $request)
    {
        try {
            $logs = $request->user()->loginLogs()
                ->latest('login_at')
                ->paginate(20);

            return response()->json($logs);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch login history'], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            if ($request->user()->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $users = User::whereIn('role', ['billing', 'admitting'])
                ->when($request->role, function ($query, $role) {
                    return $query->where('role', $role);
                })
                ->paginate(20);

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch users'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            if ($request->user()->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'name' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:users',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'required|in:billing,admitting',
            ]);

            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);

            return response()->json(['user' => $user, 'message' => 'User created successfully'], 201);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to create user'], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            if ($request->user()->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $user = User::whereIn('role', ['billing', 'admitting'])->findOrFail($id);

            return response()->json(['user' => $user]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'User not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            if ($request->user()->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $user = User::whereIn('role', ['billing', 'admitting'])->findOrFail($id);

            $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'username' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('users')->ignore($user->id),
                ],
                'email' => [
                    'sometimes',
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($user->id),
                ],
                'password' => 'sometimes|required|string|min:8|confirmed',
                'role' => 'sometimes|required|in:billing,admitting',
            ]);

            $updateData = $request->only(['name', 'username', 'email', 'role']);

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            return response()->json(['user' => $user, 'message' => 'User updated successfully']);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to update user'], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            if ($request->user()->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $user = User::whereIn('role', ['billing', 'admitting'])->findOrFail($id);

            $user->delete();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to delete user'], 500);
        }
    }
}
