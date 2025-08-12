import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import UI components
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Separator } from './components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';

// Icons
import { Search, MapPin, Calendar, Clock, Phone, Star, Navigation, Plane, Car, Train } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Homepage Component
function Homepage() {
  const [temples, setTemples] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemples, setFilteredTemples] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/temples`);
      setTemples(response.data);
      setFilteredTemples(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching temples:', error);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedState) params.append('state', selectedState);
      
      const response = await axios.get(`${API_BASE_URL}/api/search/temples?${params.toString()}`);
      setFilteredTemples(response.data);
    } catch (error) {
      console.error('Error searching temples:', error);
    }
  };

  const states = [...new Set(temples.map(temple => temple.state))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🕉️ TempleSearch
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/trip-planner">
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                  <Navigation className="w-4 h-4 mr-2" />
                  Trip Planner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Sacred 
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> Temples</span>
            <br />Across India
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Explore thousands of temples, plan spiritual journeys with AI, and experience the divine heritage of India from Jammu to Kanyakumari.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-orange-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search temples, locations, or deities..."
                  className="pl-12 h-14 text-lg border-0 bg-gray-50 rounded-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="md:w-48 h-14 bg-gray-50 border-0 rounded-2xl">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="h-14 px-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-2xl">
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Background Images */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20">
            <img src="https://images.unsplash.com/photo-1695981152719-3fc012dc3da4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGVzfGVufDB8fHx8MTc1NTAxMDk4NHww&ixlib=rb-4.1.0&q=85" alt="" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full opacity-20">
            <img src="https://images.unsplash.com/photo-1566300141301-ab0577dcba1c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHw0fHxoaW5kdSUyMHRlbXBsZXxlbnwwfHx8fDE3NTUwMTA5OTB8MA&ixlib=rb-4.1.0&q=85" alt="" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </section>

      {/* Temple Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sacred Destinations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover temples rich in history, spirituality, and architectural magnificence
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 rounded-3xl h-80"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemples.map((temple) => (
                <Card key={temple.id} className="group overflow-hidden rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/80 backdrop-blur-sm" onClick={() => navigate(`/temple/${temple.id}`)}>
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={temple.image} 
                      alt={temple.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-orange-600 text-white">
                      {temple.state}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {temple.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{temple.location}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {temple.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-orange-600 font-medium">
                        Deity: {temple.deity.split('(')[0]}
                      </div>
                      <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                        Explore →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Plan Your Spiritual Journey
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Let AI create personalized temple pilgrimage itineraries tailored to your preferences
          </p>
          <Link to="/trip-planner">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-2xl">
              <Navigation className="w-5 h-5 mr-2" />
              Start Planning
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

// Temple Detail Component
function TempleDetail() {
  const { id } = useParams();
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTempleDetail();
  }, [id]);

  const fetchTempleDetail = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/temples/${id}`);
      setTemple(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching temple details:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Temple not found</h2>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🕉️ TempleSearch
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/trip-planner">
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                  <Navigation className="w-4 h-4 mr-2" />
                  Trip Planner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Temple Header */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={temple.image} 
          alt={temple.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{temple.name}</h1>
          <div className="flex items-center text-xl">
            <MapPin className="w-6 h-6 mr-2" />
            <span>{temple.location}</span>
          </div>
        </div>
      </div>

      {/* Temple Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="timings">Timings</TabsTrigger>
                <TabsTrigger value="prasadam">Prasadam</TabsTrigger>
                <TabsTrigger value="festivals">Festivals</TabsTrigger>
                <TabsTrigger value="nearby">Nearby</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2 text-orange-600" />
                      About the Temple
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{temple.description}</p>
                    <Separator className="my-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Primary Deity</h4>
                        <p className="text-gray-600">{temple.deity}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                        <p className="text-gray-600">{temple.city}, {temple.state}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Significance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{temple.history}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-orange-600" />
                      Temple Timings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-gray-700">{temple.timings}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prasadam" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sacred Offerings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{temple.prasadam}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="festivals" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                      Major Festivals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {temple.festivals.map((festival, index) => (
                        <Badge key={index} variant="outline" className="p-3 text-center">
                          {festival}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nearby" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Nearby Attractions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {temple.nearby_attractions.map((attraction, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                          <span className="text-gray-700">{attraction}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book Darshan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700" onClick={() => window.open(temple.booking_link, '_blank')}>
                  Book Online Darshan
                </Button>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{temple.contact}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">State:</span>
                    <p className="text-gray-600">{temple.state}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">City:</span>
                    <p className="text-gray-600">{temple.city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Trip Planner Component
function TripPlanner() {
  const [formData, setFormData] = useState({
    starting_location: '',
    days: 3,
    preferred_states: []
  });
  const [tripPlan, setTripPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const states = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ];

  const handleStateToggle = (state) => {
    setFormData(prev => ({
      ...prev,
      preferred_states: prev.preferred_states.includes(state)
        ? prev.preferred_states.filter(s => s !== state)
        : [...prev.preferred_states, state]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/trip-plan`, formData);
      setTripPlan(response.data);
    } catch (error) {
      console.error('Error generating trip plan:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🕉️ TempleSearch
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Trip Planner</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let artificial intelligence create your perfect temple pilgrimage itinerary
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <Card className="p-8">
            <CardHeader>
              <CardTitle>Plan Your Journey</CardTitle>
              <CardDescription>Tell us your preferences and we'll create a personalized itinerary</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Starting Location
                  </label>
                  <Input
                    placeholder="e.g., Delhi, Mumbai, Chennai"
                    value={formData.starting_location}
                    onChange={(e) => setFormData(prev => ({...prev, starting_location: e.target.value}))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Duration (Days)
                  </label>
                  <Select value={formData.days.toString()} onValueChange={(value) => setFormData(prev => ({...prev, days: parseInt(value)}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(14)].map((_, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>{i + 1} Day{i > 0 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4">
                    Preferred States
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {states.map(state => (
                      <div
                        key={state}
                        onClick={() => handleStateToggle(state)}
                        className={`p-2 text-sm rounded-lg cursor-pointer transition-colors ${
                          formData.preferred_states.includes(state)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {state}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Plan...
                    </>
                  ) : (
                    'Generate Trip Plan'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Trip Plan Result */}
          <div>
            {tripPlan ? (
              <Card className="p-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Navigation className="w-5 h-5 mr-2 text-blue-600" />
                    {tripPlan.title}
                  </CardTitle>
                  <CardDescription>
                    {tripPlan.duration} days • {tripPlan.total_temples} temples • {tripPlan.estimated_cost}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm font-medium">{tripPlan.duration} Days</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <MapPin className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="text-sm font-medium">{tripPlan.total_temples} Temples</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <Car className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-sm font-medium">{tripPlan.best_travel_mode}</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Daily Itinerary</h3>
                    <div className="space-y-4">
                      {tripPlan.daily_itinerary.map((day, index) => (
                        <Card key={index} className="p-4 border-l-4 border-blue-600">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Day {day.day}</h4>
                            <Badge variant="outline">{day.location}</Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">Temples:</span>
                              <span className="text-gray-600 ml-2">{Array.isArray(day.temples) ? day.temples.join(', ') : day.temples}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Activities:</span>
                              <span className="text-gray-600 ml-2">{Array.isArray(day.activities) ? day.activities.join(', ') : day.activities}</span>
                            </div>
                            {day.travel_time && (
                              <div>
                                <span className="font-medium text-gray-900">Travel Time:</span>
                                <span className="text-gray-600 ml-2">{day.travel_time}</span>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-center text-sm text-gray-600">
                      Budget Estimate: <span className="font-semibold text-gray-900">{tripPlan.estimated_cost}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Navigation className="w-12 h-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Plan?</h3>
                <p className="text-gray-600">Fill out the form to generate your personalized temple pilgrimage itinerary.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/temple/:id" element={<TempleDetail />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
      </Routes>
    </Router>
  );
}

export default App;