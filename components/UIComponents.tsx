
import React from 'react';
import { RequestStatus, UrgencyLevel, RequestCategory, Comment } from '../types';
import { AlertCircle, CheckCircle2, Clock, PauseCircle, Zap, Wrench, Building, Wifi, HelpCircle, Send, Armchair, CalendarCheck, Sparkles, Flame, ShieldCheck, Fan, Hammer, Truck } from 'lucide-react';

// --- Badges ---

export const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const styles = {
    [RequestStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [RequestStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800 border-blue-200",
    [RequestStatus.ON_HOLD]: "bg-orange-100 text-orange-800 border-orange-200",
    [RequestStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
  };

  const icons = {
    [RequestStatus.PENDING]: <Clock className="w-3 h-3 mr-1" />,
    [RequestStatus.IN_PROGRESS]: <Wrench className="w-3 h-3 mr-1" />,
    [RequestStatus.ON_HOLD]: <PauseCircle className="w-3 h-3 mr-1" />,
    [RequestStatus.COMPLETED]: <CheckCircle2 className="w-3 h-3 mr-1" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel }> = ({ urgency }) => {
  const styles = {
    [UrgencyLevel.LOW]: "bg-slate-100 text-slate-600",
    [UrgencyLevel.MEDIUM]: "bg-blue-50 text-blue-600",
    [UrgencyLevel.HIGH]: "bg-red-100 text-red-600 font-bold animate-pulse",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[urgency]}`}>
      {urgency === UrgencyLevel.HIGH && <AlertCircle className="w-3 h-3 mr-1" />}
      {urgency} Priority
    </span>
  );
};

export const CategoryIcon: React.FC<{ category: RequestCategory; className?: string }> = ({ category, className = "w-5 h-5" }) => {
  switch (category) {
    case RequestCategory.ELECTRIC: return <Zap className={`${className} text-yellow-500`} />;
    case RequestCategory.MACHINERY: return <Fan className={`${className} text-slate-500`} />;
    case RequestCategory.REPAIR: return <Hammer className={`${className} text-indigo-500`} />;
    case RequestCategory.SECURITY: return <ShieldCheck className={`${className} text-blue-500`} />;
    case RequestCategory.MOVING: return <Truck className={`${className} text-orange-500`} />;
    case RequestCategory.CLEANING: return <Sparkles className={`${className} text-cyan-500`} />;
    case RequestCategory.FIRE_SYSTEM: return <Flame className={`${className} text-red-500`} />;
    default: return <HelpCircle className={`${className} text-gray-400`} />;
  }
};

// --- Inputs ---

interface FileInputProps {
  label: string;
  onChange: (file: string | null) => void;
  previewUrl?: string;
}

export const ImageUpload: React.FC<FileInputProps> = ({ label, onChange, previewUrl }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <p className="text-xs text-gray-500 mt-1">Add</p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        {previewUrl ? (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button 
                    onClick={() => onChange(null)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl shadow-sm"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        ) : (
            <div className="text-sm text-gray-400 italic">No image selected</div>
        )}
      </div>
    </div>
  );
};

// --- Comments ---

export const CommentList: React.FC<{ comments: Comment[], currentUserId: string }> = ({ comments, currentUserId }) => {
  if (comments.length === 0) return <div className="text-sm text-gray-400 italic py-2">No comments yet.</div>;

  return (
    <div className="space-y-3 mb-4">
      {comments.map((comment) => {
        const isMe = comment.authorId === currentUserId;
        return (
          <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 ${isMe ? 'bg-blue-100 text-blue-900 rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
              <p className="text-sm">{comment.text}</p>
            </div>
            <div className="flex items-center gap-1 mt-1 px-1">
              <span className="text-[10px] font-bold text-gray-500">{comment.authorName}</span>
              <span className="text-[10px] text-gray-400">• {new Date(comment.timestamp).toLocaleDateString()} {new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const CommentInput: React.FC<{ onSubmit: (text: string) => void }> = ({ onSubmit }) => {
  const [text, setText] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
      />
      <button 
        type="submit" 
        disabled={!text.trim()}
        className="absolute right-1 top-1 bottom-1 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};


// --- Modal ---

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">{title}</h3>
            {children}
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
