import React from 'react';
import { Check, XCircle, HardDrive, Settings2, RefreshCw, Play, FolderArchive, Clock, Cloud, DownloadCloud, Trash2, Info } from 'lucide-react';

export default function BackupsTab({
  backupMsg, setBackupMsg,
  backupStats, backupConfigs, backupRecords, backupTriggerLoading,
  openConfigEditor, handleTriggerBackup, fetchBackupRecords,
  handleDownloadBackup, handleDeleteBackup,
  backupConfigEditing, setBackupConfigEditing,
  backupConfigForm, setBackupConfigForm,
  handleSaveBackupConfig, backupLoading
}) {
  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {backupMsg.text && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
          backupMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <span className="flex items-center gap-2">
            {backupMsg.type === 'success' ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {backupMsg.text}
          </span>
          <button onClick={() => setBackupMsg({ type: '', text: '' })} className="font-bold">✕</button>
        </div>
      )}

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Library Functions Backup Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#670047] flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-[#ffcb00]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Library Functions</h3>
                <p className="text-[10px] text-slate-500">Auth, Circulation, Fines, Reservations, Notifications</p>
              </div>
            </div>
            <button
              onClick={() => openConfigEditor('library')}
              className="p-2 text-slate-400 hover:text-[#670047] hover:bg-slate-50 rounded-lg transition"
              title="Configure"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          {backupStats?.library && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2 rounded-lg">
                <div className="text-lg font-black text-slate-900">{backupStats.library.total_backups}</div>
                <div className="text-[10px] text-slate-500 font-bold">Total</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700">{backupStats.library.total_size_display || '0 B'}</div>
                <div className="text-[10px] text-slate-500 font-bold">Total Size</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700">
                  {backupStats.library.last_backup_at ? new Date(backupStats.library.last_backup_at).toLocaleDateString() : 'Never'}
                </div>
                <div className="text-[10px] text-slate-500 font-bold">Last Backup</div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleTriggerBackup('library', false)}
              disabled={backupTriggerLoading.library}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#670047] hover:bg-[#520038] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {backupTriggerLoading.library ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{backupTriggerLoading.library ? 'Backing up...' : 'Backup Database'}</span>
            </button>
            <button
              onClick={() => handleTriggerBackup('library', true)}
              disabled={backupTriggerLoading.library}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>+ Media</span>
            </button>
          </div>

          {backupConfigs.library && (
            <div className="text-[10px] text-slate-500 flex items-center gap-3 border-t pt-3">
              <span className={`flex items-center gap-1 font-bold ${backupConfigs.library.auto_backup_enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Clock className="w-3 h-3" />
                Auto: {backupConfigs.library.auto_backup_enabled ? `${backupConfigs.library.backup_frequency} at ${backupConfigs.library.backup_time}` : 'Disabled'}
              </span>
              <span className={`flex items-center gap-1 font-bold ${backupConfigs.library.nas_backup_enabled ? 'text-blue-600' : 'text-slate-400'}`}>
                NAS: {backupConfigs.library.nas_backup_enabled ? 'On' : 'Off'}
              </span>
              <span className={`flex items-center gap-1 font-bold ${backupConfigs.library.cloud_backup_enabled ? 'text-purple-600' : 'text-slate-400'}`}>
                <Cloud className="w-3 h-3" />
                Cloud: {backupConfigs.library.cloud_backup_enabled ? backupConfigs.library.cloud_provider : 'Off'}
              </span>
            </div>
          )}
        </div>

        {/* Repository Backup Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#1b3058] flex items-center justify-center">
                <FolderArchive className="w-5 h-5 text-[#ffcb00]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Institutional Repository</h3>
                <p className="text-[10px] text-slate-500">Research Papers, PDFs, Metadata</p>
              </div>
            </div>
            <button
              onClick={() => openConfigEditor('repository')}
              className="p-2 text-slate-400 hover:text-[#1b3058] hover:bg-slate-50 rounded-lg transition"
              title="Configure"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          {backupStats?.repository && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2 rounded-lg">
                <div className="text-lg font-black text-slate-900">{backupStats.repository.total_backups}</div>
                <div className="text-[10px] text-slate-500 font-bold">Total</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700">{backupStats.repository.total_size_display || '0 B'}</div>
                <div className="text-[10px] text-slate-500 font-bold">Total Size</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700">
                  {backupStats.repository.last_backup_at ? new Date(backupStats.repository.last_backup_at).toLocaleDateString() : 'Never'}
                </div>
                <div className="text-[10px] text-slate-500 font-bold">Last Backup</div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleTriggerBackup('repository', false)}
              disabled={backupTriggerLoading.repository}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1b3058] hover:bg-[#0f1e3a] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {backupTriggerLoading.repository ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{backupTriggerLoading.repository ? 'Backing up...' : 'Backup Database'}</span>
            </button>
            <button
              onClick={() => handleTriggerBackup('repository', true)}
              disabled={backupTriggerLoading.repository}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>+ Media</span>
            </button>
          </div>

          {backupConfigs.repository && (
            <div className="text-[10px] text-slate-500 flex items-center gap-3 border-t pt-3">
              <span className={`flex items-center gap-1 font-bold ${backupConfigs.repository.auto_backup_enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Clock className="w-3 h-3" />
                Auto: {backupConfigs.repository.auto_backup_enabled ? `${backupConfigs.repository.backup_frequency} at ${backupConfigs.repository.backup_time}` : 'Disabled'}
              </span>
              <span className={`flex items-center gap-1 font-bold ${backupConfigs.repository.nas_backup_enabled ? 'text-blue-600' : 'text-slate-400'}`}>
                NAS: {backupConfigs.repository.nas_backup_enabled ? 'On' : 'Off'}
              </span>
              <span className={`flex items-center gap-1 font-bold ${backupConfigs.repository.cloud_backup_enabled ? 'text-purple-600' : 'text-slate-400'}`}>
                <Cloud className="w-3 h-3" />
                Cloud: {backupConfigs.repository.cloud_backup_enabled ? backupConfigs.repository.cloud_provider : 'Off'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#670047]" />
            <h3 className="text-sm font-extrabold text-slate-900">Backup History</h3>
          </div>
          <button
            onClick={fetchBackupRecords}
            className="text-xs text-slate-500 hover:text-[#670047] font-bold flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {backupRecords.length === 0 ? (
          <div className="p-12 text-center">
            <HardDrive className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No backups yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Backup Database" above to create your first backup.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Service</th>
                  <th className="p-3.5">File Name</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Size</th>
                  <th className="p-3.5">Storage</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backupRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        rec.service_name === 'library' ? 'bg-[#670047]/10 text-[#670047]' : 'bg-[#1b3058]/10 text-[#1b3058]'
                      }`}>
                        {rec.service_name === 'library' ? 'Library' : 'Repository'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-700">{rec.file_name}</td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold ${rec.backup_type === 'SCHEDULED' ? 'text-blue-600' : 'text-slate-600'}`}>
                        {rec.backup_type === 'SCHEDULED' ? '⏰ Auto' : '🖐 Manual'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        rec.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {rec.status === 'COMPLETED' ? '✓ Completed' : rec.status === 'IN_PROGRESS' ? '⟳ In Progress' : '✗ Failed'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">{rec.file_size_display}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        {rec.local_path && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold" title={rec.local_path}>Local</span>}
                        {rec.nas_path && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">NAS</span>}
                        {rec.cloud_url && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-bold">Cloud</span>}
                      </div>
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-500">
                      {new Date(rec.started_at).toLocaleString()}
                      {rec.duration_seconds != null && (
                        <div className="text-[10px] text-slate-400">{rec.duration_seconds.toFixed(1)}s</div>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {rec.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleDownloadBackup(rec.id)}
                          className="text-[#670047] hover:bg-[#670047]/10 p-1.5 rounded-lg transition"
                          title="Download backup"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBackup(rec.id, rec.file_name)}
                        className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition"
                        title="Delete backup"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900">
          <p className="font-bold mb-1">Scheduled Backups</p>
          <p className="text-blue-700">
            To enable automatic scheduled backups, run the management command via cron or Windows Task Scheduler:
            <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[11px] font-mono ml-1">python manage.py run_scheduled_backup</code>
          </p>
          <p className="text-blue-700 mt-1">
            NAS backups copy to your configured UNC/network path. Cloud storage (AWS S3, Google Cloud, Azure) requires adding the respective SDK credentials in configuration.
          </p>
        </div>
      </div>

      {/* Backup Configuration Modal */}
      {backupConfigEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-[#670047]" />
                  Backup Configuration — {backupConfigEditing === 'library' ? 'Library Functions' : 'Repository'}
                </h3>
                <button onClick={() => setBackupConfigEditing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Schedule Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#670047]" /> Automatic Backup Schedule
                </h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupConfigForm.auto_backup_enabled || false}
                    onChange={(e) => setBackupConfigForm(prev => ({ ...prev, auto_backup_enabled: e.target.checked }))}
                    className="w-4 h-4 accent-[#670047]"
                  />
                  <span className="text-xs font-bold text-slate-700">Enable automatic scheduled backups</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Frequency</label>
                    <select
                      value={backupConfigForm.backup_frequency || 'DAILY'}
                      onChange={(e) => setBackupConfigForm(prev => ({ ...prev, backup_frequency: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#670047] bg-white"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Time (24h)</label>
                    <input
                      type="time"
                      value={backupConfigForm.backup_time || '02:00'}
                      onChange={(e) => setBackupConfigForm(prev => ({ ...prev, backup_time: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#670047]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Retention (days)</label>
                    <input
                      type="number"
                      min="1" max="365"
                      value={backupConfigForm.retention_days || 30}
                      onChange={(e) => setBackupConfigForm(prev => ({ ...prev, retention_days: parseInt(e.target.value) }))}
                      className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#670047]"
                    />
                  </div>
                </div>
              </div>

              {/* Local Storage */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-[#670047]" /> Local Storage
                </h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupConfigForm.local_backup_enabled !== false}
                    onChange={(e) => setBackupConfigForm(prev => ({ ...prev, local_backup_enabled: e.target.checked }))}
                    className="w-4 h-4 accent-[#670047]"
                  />
                  <span className="text-xs font-bold text-slate-700">Save backups locally</span>
                </label>
                <input
                  type="text"
                  placeholder="Custom path (leave empty for default: /backups/)"
                  value={backupConfigForm.local_backup_path || ''}
                  onChange={(e) => setBackupConfigForm(prev => ({ ...prev, local_backup_path: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* NAS / Network Storage */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-blue-600" /> NAS / Network Storage
                </h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupConfigForm.nas_backup_enabled || false}
                    onChange={(e) => setBackupConfigForm(prev => ({ ...prev, nas_backup_enabled: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-700">Copy backups to NAS / network drive</span>
                </label>
                <input
                  type="text"
                  placeholder="UNC Path: \\server\share\backups or Z:\backups"
                  value={backupConfigForm.nas_path || ''}
                  onChange={(e) => setBackupConfigForm(prev => ({ ...prev, nas_path: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>

              {/* Cloud Storage */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 text-purple-600" /> Cloud Storage
                </h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupConfigForm.cloud_backup_enabled || false}
                    onChange={(e) => setBackupConfigForm(prev => ({ ...prev, cloud_backup_enabled: e.target.checked }))}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <span className="text-xs font-bold text-slate-700">Upload backups to cloud storage</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Provider</label>
                    <select
                      value={backupConfigForm.cloud_provider || 'NONE'}
                      onChange={(e) => setBackupConfigForm(prev => ({ ...prev, cloud_provider: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="NONE">None</option>
                      <option value="AWS_S3">Amazon S3</option>
                      <option value="GOOGLE_CLOUD">Google Cloud Storage</option>
                      <option value="AZURE_BLOB">Azure Blob Storage</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Bucket / Container</label>
                    <input
                      type="text"
                      placeholder="my-lms-backups"
                      value={backupConfigForm.cloud_bucket || ''}
                      onChange={(e) => setBackupConfigForm(prev => ({ ...prev, cloud_bucket: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Access Key</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={backupConfigForm.cloud_access_key || ''}
                      onChange={(e) => setBackupConfigForm(prev => ({ ...prev, cloud_access_key: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Region</label>
                    <input
                      type="text"
                      placeholder="ap-south-1"
                      value={backupConfigForm.cloud_region || ''}
                      onChange={(e) => setBackupConfigForm(prev => ({ ...prev, cloud_region: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setBackupConfigEditing(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBackupConfig}
                disabled={backupLoading}
                className="px-6 py-2 bg-[#670047] hover:bg-[#520038] text-white text-xs font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2"
              >
                {backupLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
