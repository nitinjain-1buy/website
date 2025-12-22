import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Plus, Pencil, Trash2, RefreshCw, ArrowRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Predefined colors for flow lines
const LINE_COLORS = [
  { value: '#3b82f6', label: 'Blue', bg: 'bg-blue-500' },
  { value: '#10b981', label: 'Green', bg: 'bg-emerald-500' },
  { value: '#8b5cf6', label: 'Purple', bg: 'bg-purple-500' },
  { value: '#f59e0b', label: 'Orange', bg: 'bg-amber-500' },
  { value: '#ef4444', label: 'Red', bg: 'bg-red-500' },
  { value: '#ec4899', label: 'Pink', bg: 'bg-pink-500' },
  { value: '#06b6d4', label: 'Cyan', bg: 'bg-cyan-500' },
];

const FlowLinesManager = ({ flowLines, locations, isLoading, onRefresh }) => {
  const [editingLine, setEditingLine] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    color: '#3b82f6',
    curveBelow: false,
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const openCreateDialog = () => {
    setEditingLine(null);
    setFormData({
      fromLocation: '',
      toLocation: '',
      color: '#3b82f6',
      curveBelow: false,
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (line) => {
    setEditingLine(line);
    setFormData({
      fromLocation: line.fromLocation,
      toLocation: line.toLocation,
      color: line.color || '#3b82f6',
      curveBelow: line.curveBelow || false,
      isActive: line.isActive !== false
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.fromLocation || !formData.toLocation) {
      toast.error('Please select both From and To locations');
      return;
    }
    if (formData.fromLocation === formData.toLocation) {
      toast.error('From and To locations must be different');
      return;
    }

    setIsSaving(true);
    try {
      if (editingLine) {
        await axios.put(`${API}/flow-lines/${editingLine.id}`, formData);
        toast.success('Flow line updated');
      } else {
        await axios.post(`${API}/flow-lines`, formData);
        toast.success('Flow line created');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save flow line');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this flow line?')) return;
    try {
      await axios.delete(`${API}/flow-lines/${id}`);
      toast.success('Flow line deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete flow line');
    }
  };

  const handleToggleActive = async (line) => {
    try {
      await axios.put(`${API}/flow-lines/${line.id}`, {
        isActive: !line.isActive
      });
      toast.success(`Flow line ${line.isActive ? 'disabled' : 'enabled'}`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update flow line');
    }
  };

  const seedFlowLines = async () => {
    try {
      const result = await axios.post(`${API}/flow-lines/seed`);
      toast.success(result.data.message);
      onRefresh();
    } catch (error) {
      toast.error('Failed to seed flow lines');
    }
  };

  const getColorInfo = (hex) => {
    return LINE_COLORS.find(c => c.value === hex) || { label: hex, bg: 'bg-gray-500' };
  };

  // Get unique location names for dropdowns
  const locationNames = locations.map(loc => loc.name).sort();

  const activeCount = flowLines.filter(l => l.isActive !== false).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Flow Lines</h3>
          <p className="text-sm text-slate-500">
            Manage animated connection lines on the world map • {activeCount} active / {flowLines.length} total
          </p>
        </div>
        <div className="flex gap-2">
          {flowLines.length === 0 && (
            <Button onClick={seedFlowLines} variant="outline">Load Defaults</Button>
          )}
          <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Flow Line
          </Button>
        </div>
      </div>

      {/* Quick Add Section */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h4 className="font-medium text-slate-900 mb-2">💡 Quick Tips</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• <strong>Curve Below</strong>: Enable for lines going westward (e.g., Asia → Americas) to avoid crossing Europe</li>
          <li>• <strong>Colors</strong>: Use consistent colors for source regions (e.g., all China lines = Purple)</li>
          <li>• <strong>Active Toggle</strong>: Disable lines temporarily without deleting them</li>
        </ul>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
        </div>
      ) : flowLines.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No flow lines configured</p>
          <Button onClick={seedFlowLines} variant="outline" className="mt-4">
            Load Default Flow Lines
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead></TableHead>
                <TableHead>To</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Curve Below</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flowLines.map((line) => {
                const colorInfo = getColorInfo(line.color);
                return (
                  <TableRow key={line.id} className={line.isActive === false ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{line.fromLocation}</TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </TableCell>
                    <TableCell className="font-medium">{line.toLocation}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${colorInfo.bg}`}></div>
                        <span className="text-sm text-slate-600">{colorInfo.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {line.curveBelow ? (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Below</span>
                      ) : (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Above</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={line.isActive !== false}
                        onCheckedChange={() => handleToggleActive(line)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(line)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(line.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLine ? 'Edit Flow Line' : 'Add Flow Line'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Location *</Label>
                <Select value={formData.fromLocation} onValueChange={(v) => setFormData({ ...formData, fromLocation: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationNames.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Location *</Label>
                <Select value={formData.toLocation} onValueChange={(v) => setFormData({ ...formData, toLocation: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationNames.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Line Color</Label>
              <div className="flex flex-wrap gap-2">
                {LINE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                      formData.color === color.value 
                        ? 'border-slate-900 scale-110' 
                        : 'border-transparent hover:border-slate-300'
                    }`}
                    title={color.label}
                  >
                    <div className={`w-6 h-6 rounded ${color.bg}`}></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base">Curve Below</Label>
                <p className="text-xs text-slate-500">Enable for lines going west (e.g., Asia → Americas)</p>
              </div>
              <Switch
                checked={formData.curveBelow}
                onCheckedChange={(checked) => setFormData({ ...formData, curveBelow: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base">Active</Label>
                <p className="text-xs text-slate-500">Show this line on the map</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowLinesManager;
