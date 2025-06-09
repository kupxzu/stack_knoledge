import React, { useEffect, useRef } from 'react';

const AnimationBG = ({ 
  variant = 'medical', 
  color = 'green', 
  intensity = 'medium',
  className = '',
  children 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  // Color schemes
  const colorSchemes = {
    blue: {
      primary: 'rgba(59, 130, 246, 0.6)',
      secondary: 'rgba(147, 197, 253, 0.4)',
      accent: 'rgba(219, 234, 254, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%)'
    },
    green: {
      primary: 'rgba(16, 185, 129, 0.6)',
      secondary: 'rgba(110, 231, 183, 0.4)',
      accent: 'rgba(209, 250, 229, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(110, 231, 183, 0.05) 100%)'
    },
    purple: {
      primary: 'rgba(139, 92, 246, 0.6)',
      secondary: 'rgba(196, 181, 253, 0.4)',
      accent: 'rgba(237, 233, 254, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(196, 181, 253, 0.05) 100%)'
    }
  };

  // Intensity settings - increased size values
  const intensitySettings = {
    low: { particleCount: 15, speed: 0.5, size: 1.5 },      // was 0.8
    medium: { particleCount: 25, speed: 1, size: 2.0 },     // was 1
    high: { particleCount: 40, speed: 1.5, size: 2.5 }      // was 1.2
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const settings = intensitySettings[intensity];
    const colors = colorSchemes[color];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.fadeDelay = Math.random() * 600;
        this.fadeStart = Date.now() + this.fadeDelay;
        this.fadingOut = false;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 1000;
        this.vx = (Math.random() - 0.5) * settings.speed;
        this.vy = (Math.random() - 0.5) * settings.speed;
        // Increased base size range from 3 to 6, and multiplied by larger settings.size
        this.size = (Math.random() * 6 + 3) * settings.size; // was (Math.random() * 3 + 1)
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = 0;
        this.life = 0;
        this.maxLife = 200 + Math.random() * 300;
        this.fadeDelay = Math.random() * 600;
        this.fadeStart = Date.now() + this.fadeDelay;
        this.fadingOut = false;
      }

      update() {
        this.life++;
        this.angle += this.angleSpeed;
        
        // Movement
        this.x += this.vx;
        this.y += this.vy;
        
        // Fade in
        if (Date.now() > this.fadeStart && this.life < this.maxLife / 4) {
          this.opacity = Math.min(0.6, this.opacity + 0.02);
        }
        
        // Fade out
        if (this.life > this.maxLife * 0.75) {
          this.fadingOut = true;
          this.opacity *= 0.96;
        }
        
        // Reset if off screen or life ended
        if (this.x < -50 || this.x > canvas.width + 50 || 
            this.y < -50 || this.y > canvas.height + 50 || 
            this.life > this.maxLife) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        if (variant === 'medical') {
          // Draw medical cross
          this.drawMedicalCross();
        } else if (variant === 'geometric') {
          // Draw geometric shapes
          this.drawGeometric();
        } else if (variant === 'dots') {
          // Draw simple dots
          this.drawDots();
        } else {
          // Default circles
          this.drawCircle();
        }
        
        ctx.restore();
      }

      drawMedicalCross() {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        const size = this.size;
        const crossSize = size * 1.2; // Increased from 0.8 to 1.2
        
        // Set color based on scheme
        ctx.fillStyle = colors.primary;
        
        // Vertical bar
        ctx.fillRect(-crossSize/6, -crossSize/2, crossSize/3, crossSize);
        // Horizontal bar
        ctx.fillRect(-crossSize/2, -crossSize/6, crossSize, crossSize/3);
      }

      drawGeometric() {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        const size = this.size * 1.3; // Made geometric shapes bigger too
        
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 2; // Increased line width from 1 to 2
        ctx.strokeRect(-size/2, -size/2, size, size);
      }

      drawDots() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = colors.primary;
        ctx.fill();
      }

      drawCircle() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        );
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(1, colors.secondary);
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < settings.particleCount; i++) {
      particlesRef.current.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variant, color, intensity]);

  return (
    <div className={`relative ${className}`}>
      {/* Background gradient */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          background: colorSchemes[color].gradient,
          opacity: intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.5 : 0.7
        }}
      />
      
      {/* Animated canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ mixBlendMode: 'multiply' }}
      />
      
      {/* Content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export default AnimationBG;