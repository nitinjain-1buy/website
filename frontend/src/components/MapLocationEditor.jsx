import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Plus, Trash2, GripVertical, RefreshCw } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MapLocationEditor = ({ locations, isLoading, onRefresh }) => {
  const [draggingId, setDraggingId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', x: 50, y: 50, type: 'Data Source' });
  const [isSaving, setIsSaving] = useState(false);
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // World map image URL
  const worldMapImage = "https://customer-assets.emergentagent.com/job_procure-sphere/artifacts/4a54wyou_Screenshot%20from%202025-12-21%2018-55-27.png";

  // Convert mouse position to SVG coordinates (0-100 percentage)
  const getMousePosition = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  };

  // Handle drag start
  const handleMouseDown = (e, location) => {
    e.preventDefault();
    setDraggingId(location.id);
    setSelectedLocation(location);
  };

  // Handle drag move
  const handleMouseMove = (e) => {
    if (!draggingId) return;
    
    const pos = getMousePosition(e);
    
    // Update location position locally for real-time feedback
    const updatedLocations = locations.map(loc => 
      loc.id === draggingId ? { ...loc, x: pos.x, y: pos.y } : loc
    );
    
    // Find and update the dragging location in state
    const draggedLoc = updatedLocations.find(l => l.id === draggingId);
    if (draggedLoc) {
      setSelectedLocation(draggedLoc);
    }
  };

  // Handle drag end - save to backend
  const handleMouseUp = async (e) => {
    if (!draggingId) return;
    
    const pos = getMousePosition(e);
    const locationToUpdate = locations.find(l => l.id === draggingId);
    
    if (locationToUpdate) {
      try {
        await axios.put(`${API}/map-locations/${draggingId}`, {
          x: Math.round(pos.x * 10) / 10,
          y: Math.round(pos.y * 10) / 10
        });
        toast.success(`${locationToUpdate.name} position updated`);
        onRefresh();
      } catch (error) {
        toast.error('Failed to update position');
      }
    }
    
    setDraggingId(null);
  };

  // Handle click on empty space to add new location
  const handleMapClick = (e) => {
    if (draggingId) return;
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    
    const pos = getMousePosition(e);
    setNewLocation({ 
      name: '', 
      x: Math.round(pos.x * 10) / 10, 
      y: Math.round(pos.y * 10) / 10, 
      type: 'Data Source' 
    });
    setIsAddDialogOpen(true);
  };

  // Add new location
  const handleAddLocation = async () => {
    if (!newLocation.name.trim()) {
      toast.error('Please enter a location name');
      return;
    }
    
    setIsSaving(true);
    try {
      await axios.post(`${API}/map-locations`, {
        name: newLocation.name,
        x: newLocation.x,
        y: newLocation.y,
        type: newLocation.type,
        order: locations.length
      });
      toast.success(`${newLocation.name} added`);
      setIsAddDialogOpen(false);
      setNewLocation({ name: '', x: 50, y: 50, type: 'Data Source' });
      onRefresh();
    } catch (error) {
      toast.error('Failed to add location');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete location
  const handleDelete = async (location) => {
    if (!window.confirm(`Delete ${location.name}?`)) return;
    
    try {
      await axios.delete(`${API}/map-locations/${location.id}`);
      toast.success(`${location.name} deleted`);
      setSelectedLocation(null);
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete location');
    }
  };

  // Update location type
  const handleTypeChange = async (location, newType) => {
    try {
      await axios.put(`${API}/map-locations/${location.id}`, { type: newType });
      toast.success(`${location.name} updated to ${newType}`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update type');
    }
  };

  // Seed default locations
  const seedLocations = async () => {
    try {
      const result = await axios.post(`${API}/map-locations/seed`);
      toast.success(result.data.message);
      onRefresh();
    } catch (error) {
      toast.error('Failed to seed locations');
    }
  };

  // Get current position of dragging element
  const getLocationPosition = (location) => {
    if (draggingId === location.id && selectedLocation) {
      return { x: selectedLocation.x, y: selectedLocation.y };
    }
    return { x: location.x, y: location.y };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <p className="text-slate-500 mb-4">No map locations yet</p>
        <Button onClick={seedLocations} variant="outline">
          Load Default Locations
        </Button>
      </div>
    );
  }

  const sourcingHubs = locations.filter(l => l.type === 'Sourcing Hub').length;
  const dataSources = locations.filter(l => l.type === 'Data Source').length;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Visual Map Editor</h3>
          <p className="text-sm text-slate-500">
            Drag markers to reposition • Click empty space to add • 
            <span className="text-emerald-600 ml-1">{sourcingHubs} Sourcing Hubs</span>, 
            <span className="text-blue-600 ml-1">{dataSources} Data Sources</span>
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Map Editor */}
      <div 
        ref={containerRef}
        className="relative bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-600 cursor-crosshair"
        style={{ aspectRatio: '2/1' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMapClick}
      >
        {/* World Map Background */}
        <img 
          src={worldMapImage} 
          alt="World Map"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          style={{ pointerEvents: 'none' }}
        />

        {/* SVG Overlay for markers */}
        <svg 
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="markerGlow">
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="selectedGlow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render markers */}
          {locations.map((location) => {
            const pos = getLocationPosition(location);
            const isSelected = selectedLocation?.id === location.id;
            const isHovered = hoveredLocation?.id === location.id;
            const isDragging = draggingId === location.id;
            const markerColor = location.type === 'Sourcing Hub' ? '#10b981' : '#3b82f6';
            
            return (
              <g 
                key={location.id}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                {/* Pulse ring for selected/hovered */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 3 : 2.5}
                    fill="none"
                    stroke={markerColor}
                    strokeWidth="0.3"
                    opacity="0.8"
                  >
                    <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                
                {/* Main marker */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 2 : 1.5}
                  fill={markerColor}
                  stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.7)'}
                  strokeWidth={isSelected ? 0.5 : 0.3}
                  filter={isSelected ? 'url(#selectedGlow)' : 'url(#markerGlow)'}
                  onMouseDown={(e) => handleMouseDown(e, location)}
                  onMouseEnter={() => setHoveredLocation(location)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  style={{ cursor: 'grab' }}
                />
                
                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y - 3}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={isSelected ? 2.2 : 1.8}
                  fontWeight={isSelected ? '700' : '600'}
                  style={{ 
                    pointerEvents: 'none',
                    textShadow: '0 0 4px rgba(0,0,0,0.9)'
                  }}
                >
                  {location.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Coordinates display */}
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Top-Left: (0, 0)
        </div>
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Bottom-Right: (100, 100)
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded px-3 py-2">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-white">Sourcing Hub</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-white">Data Source</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Location Info Panel */}
      {selectedLocation && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${selectedLocation.type === 'Sourcing Hub' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
              <div>
                <h4 className="font-semibold text-slate-900">{selectedLocation.name}</h4>
                <p className="text-sm text-slate-500">
                  Position: ({Math.round(selectedLocation.x * 10) / 10}, {Math.round(selectedLocation.y * 10) / 10})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                value={selectedLocation.type} 
                onValueChange={(v) => handleTypeChange(selectedLocation, v)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sourcing Hub">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Sourcing Hub
                    </span>
                  </SelectItem>
                  <SelectItem value="Data Source">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Data Source
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDelete(selectedLocation)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Location List (compact) */}
      <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-2">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => setSelectedLocation(location)}
            className={`p-2 rounded-lg border text-left transition-all ${
              selectedLocation?.id === location.id 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${location.type === 'Sourcing Hub' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
              <span className="text-sm font-medium text-slate-700 truncate">{location.name}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">({location.x}, {location.y})</p>
          </button>
        ))}
      </div>

      {/* Add Location Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="e.g., Singapore, Mexico"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>X Position (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={newLocation.x}
                  onChange={(e) => setNewLocation({ ...newLocation, x: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Y Position (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={newLocation.y}
                  onChange={(e) => setNewLocation({ ...newLocation, y: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newLocation.type} onValueChange={(v) => setNewLocation({ ...newLocation, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sourcing Hub">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Sourcing Hub (Green)
                    </span>
                  </SelectItem>
                  <SelectItem value="Data Source">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Data Source (Blue)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddLocation} disabled={isSaving}>
                {isSaving ? 'Adding...' : 'Add Location'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapLocationEditor;
