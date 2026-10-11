const fs = require('fs');
const path = 'c:/Users/kapee/Documents/LMS/frontend/src/pages/AdminDashboardPage.jsx';

let code = fs.readFileSync(path, 'utf8');

const imports = `import OverviewTab from '../components/admin/OverviewTab';
import BackupsTab from '../components/admin/BackupsTab';
import CustomFieldsTab from '../components/admin/CustomFieldsTab';
`;

// Insert imports after the last import
const lastImportIndex = code.lastIndexOf('import');
const endOfLastImport = code.indexOf('\n', lastImportIndex) + 1;
code = code.slice(0, endOfLastImport) + imports + code.slice(endOfLastImport);


// Replace Overview Tab
const overviewRegex = /{activeTab === 'overview' && metrics && \([\s\S]*?{activeTab === 'catalog' && \(/;
const overviewMatch = code.match(overviewRegex);
if (overviewMatch) {
  const replacement = `{activeTab === 'overview' && metrics && (
        <OverviewTab metrics={metrics} bookStats={bookStats} />
      )}

      {/* TAB: CATALOG & BOOKS MANAGEMENT */}
      {activeTab === 'catalog' && (`;
  code = code.replace(overviewMatch[0], replacement);
}

// Replace Backups Tab
const backupsRegex = /{activeTab === 'backups' && \([\s\S]*?{activeTab === 'custom_fields' && \(/;
const backupsMatch = code.match(backupsRegex);
if (backupsMatch) {
  const replacement = `{activeTab === 'backups' && (
        <BackupsTab 
          backupMsg={backupMsg} setBackupMsg={setBackupMsg}
          backupStats={backupStats} backupConfigs={backupConfigs} backupRecords={backupRecords} backupTriggerLoading={backupTriggerLoading}
          openConfigEditor={openConfigEditor} handleTriggerBackup={handleTriggerBackup} fetchBackupRecords={fetchBackupRecords}
          handleDownloadBackup={handleDownloadBackup} handleDeleteBackup={handleDeleteBackup}
          backupConfigEditing={backupConfigEditing} setBackupConfigEditing={setBackupConfigEditing}
          backupConfigForm={backupConfigForm} setBackupConfigForm={setBackupConfigForm}
          handleSaveBackupConfig={handleSaveBackupConfig} backupLoading={backupLoading}
        />
      )}

      {/* TAB: CUSTOM FIELDS */}
      {activeTab === 'custom_fields' && (`;
  code = code.replace(backupsMatch[0], replacement);
}

// Replace Custom Fields Tab
const customFieldsRegex = /{activeTab === 'custom_fields' && \([\s\S]*?{adminBookModalOpen && \(/;
const customFieldsMatch = code.match(customFieldsRegex);
if (customFieldsMatch) {
  const replacement = `{activeTab === 'custom_fields' && (
        <CustomFieldsTab 
          customFieldMsg={customFieldMsg}
          isEditingCustomField={isEditingCustomField} setIsEditingCustomField={setIsEditingCustomField}
          customFieldForm={customFieldForm} setCustomFieldForm={setCustomFieldForm}
          handleSaveCustomField={handleSaveCustomField}
          customFields={customFields}
          handleDeleteCustomField={handleDeleteCustomField}
        />
      )}

      {/* Book Form Modal (Add / Edit) */}
      {adminBookModalOpen && (`;
  code = code.replace(customFieldsMatch[0], replacement);
}

fs.writeFileSync(path, code);
console.log('Refactoring applied successfully.');
