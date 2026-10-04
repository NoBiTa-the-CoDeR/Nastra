import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../store/useAppStore';
import { CommunityReport } from '../../types';
import {
  Users,
  X,
  AlertCircle,
  ThumbsUp,
  MapPin,
  Clock,
  Send,
  PlusCircle,
  CheckCircle2,
  Filter,
  Flame,
  Wind,
  Droplets,
  Trees,
  Trash2,
  Volume2,
  HelpCircle
} from 'lucide-react';

export const CommunityModal: React.FC = () => {
  const currentLocation = useAppStore(s => s.currentLocation);
  const communityReports = useAppStore(s => s.communityReports);
  const selectedReport = useAppStore(s => s.selectedReport);
  const isReportModalOpen = useAppStore(s => s.isReportModalOpen);
  const selectReport = useAppStore(s => s.selectReport);
  const setReportModalOpen = useAppStore(s => s.setReportModalOpen);
  const submitNewReport = useAppStore(s => s.submitNewReport);
  const upvoteReport = useAppStore(s => s.upvoteReport);

  const [activeTab, setActiveTab] = useState<'browse' | 'submit'>('browse');
  const [filterType, setFilterType] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CommunityReport['type']>('waste');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [locationName, setLocationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isReportModalOpen && !selectedReport) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    // Slight random offset near city center for 3D placement
    const offsetLng = (Math.random() - 0.5) * 0.05;
    const offsetLat = (Math.random() - 0.5) * 0.05;

    await submitNewReport({
      title: title.trim(),
      description: description.trim(),
      type,
      severity,
      locationName: locationName.trim() || `${currentLocation.name} Sector`,
      coordinates: [currentLocation.center[0] + offsetLng, currentLocation.center[1] + offsetLat],
      author: 'Citizen Eco-Contributor',
      status: 'Investigating'
    });

    // Confetti celebration animation!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsSubmitting(false);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setTitle('');
      setDescription('');
      setLocationName('');
      setActiveTab('browse');
    }, 1800);
  };

  const getCategoryIcon = (t: string) => {
    switch (t) {
      case 'waste': return <Trash2 className="w-3.5 h-3.5 text-rose-400" />;
      case 'air': return <Wind className="w-3.5 h-3.5 text-amber-400" />;
      case 'water': return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
      case 'green': return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
      case 'dumping': return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      case 'noise': return <Volume2 className="w-3.5 h-3.5 text-purple-400" />;
      default: return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const filteredReports = filterType === 'all'
    ? communityReports
    : communityReports.filter(r => r.type === filterType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-active rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden border border-cyan-500/30 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">Community Environmental Watch</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {communityReports.length} Reports Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Citizen ground truth & environmental anomaly reporting for {currentLocation.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setReportModalOpen(false);
              selectReport(null);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`pb-2.5 text-xs font-semibold px-2 border-b-2 transition-all ${
                activeTab === 'browse'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Browse Reports ({communityReports.length})
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`pb-2.5 text-xs font-semibold px-2 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'submit'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit Ground Report</span>
            </button>
          </div>

          {activeTab === 'browse' && (
            <div className="flex items-center gap-1 pb-2">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg text-[11px] text-slate-300 px-2 py-1 outline-none font-mono"
              >
                <option value="all">All Categories</option>
                <option value="waste">Waste</option>
                <option value="air">Air Pollution</option>
                <option value="water">Water Pollution</option>
                <option value="green">Green Space</option>
                <option value="dumping">Illegal Dumping</option>
                <option value="noise">Noise</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'browse' ? (
            <div className="space-y-3">
              {/* If a report is specifically selected from 3D map click */}
              {selectedReport && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-400/50 mb-4 shadow-lg shadow-cyan-950/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-semibold">
                      SELECTED 3D MARKER
                    </span>
                    <span className="text-[10.5px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedReport.timestamp}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{selectedReport.title}</h4>
                  <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">{selectedReport.description}</p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{selectedReport.locationName}</span>
                    </div>
                    <button
                      onClick={() => upvoteReport(selectedReport.id)}
                      className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 flex items-center gap-1.5 text-xs font-mono transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{selectedReport.upvotes} Upvotes</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Feed list */}
              {filteredReports.map(report => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                        {getCategoryIcon(report.type)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{report.title}</div>
                        <div className="text-[10.5px] text-slate-400 flex items-center gap-2">
                          <span className="capitalize">{report.type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span className="text-cyan-400 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {report.locationName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9.5px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold ${
                        report.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : report.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {report.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{report.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 mb-2 leading-relaxed">
                    {report.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                    <span className="text-slate-400 font-mono">By: {report.author}</span>
                    <button
                      onClick={() => upvoteReport(report.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-white/10 text-slate-300 flex items-center gap-1.5 text-xs font-mono transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{report.upvotes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submittedSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mb-3 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">Report Verified & Mapped!</h4>
                  <p className="text-xs text-slate-300 max-w-sm">
                    3D marker added to the {currentLocation.name} digital twin. Community telemetry updated.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Report Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Hazardous chemical discharge into storm canal"
                      className="w-full bg-slate-900/80 border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-slate-900/80 border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="waste">Waste</option>
                        <option value="air">Air Pollution</option>
                        <option value="water">Water Pollution</option>
                        <option value="green">Green-Space Damage</option>
                        <option value="dumping">Illegal Dumping</option>
                        <option value="noise">Noise</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Severity</label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as any)}
                        className="w-full bg-slate-900/80 border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="low">Low Concern</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">Critical Hazard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Specific Location / Landmark</label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder={`e.g. Near Metro Pillar #142, ${currentLocation.name}`}
                      className="w-full bg-slate-900/80 border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Description & Evidence Details</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe observed environmental impact, odor, plumes, volume or duration..."
                      className="w-full bg-slate-900/80 border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('browse')}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Transmitting...' : 'Submit & Pin on 3D Twin'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
