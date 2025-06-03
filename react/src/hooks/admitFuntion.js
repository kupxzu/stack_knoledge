  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    civil_status: 'single',
    gender: 'male',
    dob: '',
    contact_number: '',
    admitted_date: '',
    address: '',
    room_name: '',
    room_description: '',
    physician_first_name: '',
    physician_last_name: '',
    physician_middle_name: '',
    physician_suffix: '',
    physician_gender: 'male'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [addresses, setAddresses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [physicians, setPhysicians] = useState([]);
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showPhysicianModal, setShowPhysicianModal] = useState(false);
  
  const [newAddress, setNewAddress] = useState('');
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [newPhysician, setNewPhysician] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    gender: 'male'
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [addressesRes, roomsRes, physiciansRes] = await Promise.all([
          api.get('/patient-addresses'),
          api.get('/patient-rooms'),
          api.get('/patient-physicians')
        ]);

        setAddresses(addressesRes.data.data.map(addr => addr.address));
        setRooms(roomsRes.data.data || []);
        setPhysicians(physiciansRes.data.data || []);
      } catch (error) {
        console.error('Error loading initial data:', error);
        const savedAddresses = JSON.parse(localStorage.getItem('addresses') || '[]');
        const savedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
        const savedPhysicians = JSON.parse(localStorage.getItem('physicians') || '[]');
        
        setAddresses(savedAddresses);
        setRooms(savedRooms);
        setPhysicians(savedPhysicians);
      }
    };

    loadInitialData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddAddress = async () => {
    if (newAddress.trim()) {
      try {
        await api.post('/patient-addresses', { address: newAddress.trim() });
        setFormData({ ...formData, address: newAddress.trim() });
        setNewAddress('');
        setShowAddressModal(false);
        loadAddresses();
      } catch (error) {
        const updatedAddresses = [...addresses, newAddress.trim()];
        setAddresses(updatedAddresses);
        localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
        setFormData({ ...formData, address: newAddress.trim() });
        setNewAddress('');
        setShowAddressModal(false);
      }
    }
  };

  const handleAddRoom = async () => {
    if (newRoom.name.trim()) {
      try {
        await api.post('/patient-rooms', {
          room_name: newRoom.name.trim(),
          description: newRoom.description.trim()
        });
        setFormData({ 
          ...formData, 
          room_name: newRoom.name.trim(),
          room_description: newRoom.description.trim()
        });
        setNewRoom({ name: '', description: '' });
        setShowRoomModal(false);
        loadRooms();
      } catch (error) {
        const roomData = {
          id: Date.now(),
          name: newRoom.name.trim(),
          description: newRoom.description.trim()
        };
        const updatedRooms = [...rooms, roomData];
        setRooms(updatedRooms);
        localStorage.setItem('rooms', JSON.stringify(updatedRooms));
        setFormData({ 
          ...formData, 
          room_name: newRoom.name.trim(),
          room_description: newRoom.description.trim()
        });
        setNewRoom({ name: '', description: '' });
        setShowRoomModal(false);
      }
    }
  };

  const handleAddPhysician = async () => {
    if (newPhysician.first_name.trim() && newPhysician.last_name.trim()) {
      try {
        await api.post('/patient-physicians', {
          first_name: newPhysician.first_name.trim(),
          last_name: newPhysician.last_name.trim(),
          middle_name: newPhysician.middle_name.trim(),
          suffix: newPhysician.suffix.trim(),
          gender: newPhysician.gender
        });
        setFormData({
          ...formData,
          physician_first_name: newPhysician.first_name.trim(),
          physician_last_name: newPhysician.last_name.trim(),
          physician_middle_name: newPhysician.middle_name.trim(),
          physician_suffix: newPhysician.suffix.trim(),
          physician_gender: newPhysician.gender
        });
        setNewPhysician({
          first_name: '',
          last_name: '',
          middle_name: '',
          suffix: '',
          gender: 'male'
        });
        setShowPhysicianModal(false);
        loadPhysicians();
      } catch (error) {
        const physicianData = {
          id: Date.now(),
          ...newPhysician,
          first_name: newPhysician.first_name.trim(),
          last_name: newPhysician.last_name.trim(),
          middle_name: newPhysician.middle_name.trim(),
          suffix: newPhysician.suffix.trim()
        };
        const updatedPhysicians = [...physicians, physicianData];
        setPhysicians(updatedPhysicians);
        localStorage.setItem('physicians', JSON.stringify(updatedPhysicians));
        setFormData({
          ...formData,
          physician_first_name: newPhysician.first_name.trim(),
          physician_last_name: newPhysician.last_name.trim(),
          physician_middle_name: newPhysician.middle_name.trim(),
          physician_suffix: newPhysician.suffix.trim(),
          physician_gender: newPhysician.gender
        });
        setNewPhysician({
          first_name: '',
          last_name: '',
          middle_name: '',
          suffix: '',
          gender: 'male'
        });
        setShowPhysicianModal(false);
      }
    }
  };

  const handleRoomSelect = (room) => {
    setFormData({
      ...formData,
      room_name: room.name,
      room_description: room.description
    });
  };

  const handlePhysicianSelect = (physician) => {
    setFormData({
      ...formData,
      physician_first_name: physician.first_name,
      physician_last_name: physician.last_name,
      physician_middle_name: physician.middle_name,
      physician_suffix: physician.suffix,
      physician_gender: physician.gender
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/patients', formData);

      if (response.data) {
        setMessage('Patient admitted successfully!');
        setFormData({
          first_name: '',
          last_name: '',
          middle_name: '',
          suffix: '',
          civil_status: 'single',
          gender: 'male',
          dob: '',
          contact_number: '',
          admitted_date: '',
          address: '',
          room_name: '',
          room_description: '',
          physician_first_name: '',
          physician_last_name: '',
          physician_middle_name: '',
          physician_suffix: '',
          physician_gender: 'male'
        });
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error admitting patient');
    } finally {
      setLoading(false);
    }
  };