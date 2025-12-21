import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
import { Plus, Pencil, Trash2, RefreshCw, GripVertical } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Common emoji options for region cards
const EMOJI_OPTIONS = ['🏭', '🔧', '🚀', '🎯', '🌎', '🌍', '🌏', '⚡', '🔌', '💡', '🛠️', '📦', '🏢', '✨', '🌐'];

const RegionCardsManager = ({ regionCards, isLoading, onRefresh }) => {
  const [editingCard, setEditingCard] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', countries: '', icon: '🌍', type: '', order: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const openCreateDialog = () => {
    setEditingCard(null);
    setFormData({ name: '', countries: '', icon: '🌍', type: '', order: regionCards.length });
    setIsDialogOpen(true);
  };

  const openEditDialog = (card) => {
    setEditingCard(card);
    setFormData({ 
      name: card.name, 
      countries: card.countries, 
      icon: card.icon || '🌍',
      type: card.type,
      order: card.order || 0 
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.type) {
      toast.error('Please fill in name and type');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        countries: formData.countries,
        icon: formData.icon,
        type: formData.type,
        order: parseInt(formData.order) || 0
      };
      
      if (editingCard) {
        await axios.put(`${API}/region-cards/${editingCard.id}`, payload);
        toast.success('Region card updated');
      } else {
        await axios.post(`${API}/region-cards`, payload);
        toast.success('Region card created');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save region card');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" region card?`)) return;
    try {
      await axios.delete(`${API}/region-cards/${id}`);
      toast.success('Region card deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete region card');
    }
  };

  const seedCards = async () => {
    try {
      const result = await axios.post(`${API}/region-cards/seed`);
      toast.success(result.data.message);
      onRefresh();
    } catch (error) {
      toast.error('Failed to seed region cards');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Region Cards</h3>
          <p className="text-sm text-slate-500">
            Manage the region info cards displayed below the world map
          </p>
        </div>
        <div className="flex gap-2">
          {regionCards.length === 0 && (
            <Button onClick={seedCards} variant="outline">Load Defaults</Button>
          )}
          <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Region Card
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 bg-slate-800 rounded-xl">
        <p className="text-xs text-slate-400 mb-3">Preview (as shown on homepage):</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {regionCards.map((region) => (
            <div
              key={region.id}
              className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
            >
              <div className="text-xl mb-1">{region.icon}</div>
              <h4 className="font-semibold text-white text-xs">{region.name}</h4>
              <p className="text-xs text-slate-400 truncate">{region.countries}</p>
              <p className="text-xs text-emerald-400 mt-0.5">{region.type}</p>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
        </div>
      ) : regionCards.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No region cards yet</p>
          <Button onClick={seedCards} variant="outline" className="mt-4">
            Load Default Region Cards
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-16">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Countries/Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regionCards.map((card, index) => (
                <TableRow key={card.id}>
                  <TableCell className="font-medium text-slate-500">
                    <GripVertical className="h-4 w-4 inline mr-1 text-slate-300" />
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-2xl">{card.icon}</TableCell>
                  <TableCell className="font-medium">{card.name}</TableCell>
                  <TableCell className="text-slate-600">{card.countries}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                      {card.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(card)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(card.id, card.name)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCard ? 'Edit Region Card' : 'Add Region Card'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                      formData.icon === emoji 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Far East, South East Asia"
              />
            </div>
            <div className="space-y-2">
              <Label>Countries / Description</Label>
              <Input
                value={formData.countries}
                onChange={(e) => setFormData({ ...formData, countries: e.target.value })}
                placeholder="e.g., China, Taiwan, Japan, Korea"
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Input
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., Manufacturing, Assembly, Design & Mfg"
              />
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                placeholder="0"
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

export default RegionCardsManager;
