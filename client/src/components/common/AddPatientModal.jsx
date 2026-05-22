import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import FileUpload from './FileUpload';

const AddPatientModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    contact: '',
    address: '',
    bloodGroup: '',
    medicalHistory: '',
    avatar: '',
    avatarPublicId: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('/api/v1/patients', formData);
      toast.success('Patient added successfully');
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content card"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="card-header border-b pb-4 mb-5">
          <h2 className="text-lg font-bold">Add New Patient</h2>
          <button className="icon-btn w-8 h-8" onClick={onClose}><X size={16} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="input-group col-span-2">
            <label className="input-label">Full Name</label>
            <input type="text" className="input-field" required 
              onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label className="input-label">Age</label>
            <input type="number" className="input-field" required 
              onChange={e => setFormData({...formData, age: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label className="input-label">Gender</label>
            <select className="input-field" onChange={e => setFormData({...formData, gender: e.target.value})}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="input-group">
            <label className="input-label">Contact Number</label>
            <input type="text" className="input-field" required 
              onChange={e => setFormData({...formData, contact: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label className="input-label">Blood Group</label>
            <input type="text" className="input-field" placeholder="e.g. O+"
              onChange={e => setFormData({...formData, bloodGroup: e.target.value})} />
          </div>

          <div className="input-group col-span-2">
            <label className="input-label">Residential Address</label>
            <input type="text" className="input-field" required placeholder="e.g. 123 Main St, New York"
              onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <div className="input-group col-span-2">
            <label className="input-label">Patient Profile Picture (Optional)</label>
            <FileUpload
              type="avatar"
              accept="image/*"
              maxSize={2 * 1024 * 1024}
              label="Drag and drop profile photo or click"
              value={formData.avatar}
              publicId={formData.avatarPublicId}
              onUploadSuccess={({ url, publicId }) => setFormData({ ...formData, avatar: url, avatarPublicId: publicId })}
              onRemove={() => setFormData({ ...formData, avatar: '', avatarPublicId: '' })}
            />
          </div>
          
          <div className="input-group col-span-2">
            <label className="input-label">Medical History</label>
            <textarea className="input-field" rows="2" placeholder="Previous conditions..."
              onChange={e => setFormData({...formData, medicalHistory: e.target.value})}></textarea>
          </div>

          <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-border">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddPatientModal;
