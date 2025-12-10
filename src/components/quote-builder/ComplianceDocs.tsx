'use client'

import React from 'react';
import { FileCheck, Upload } from 'lucide-react';
import Button from '@/components/ui/button';

interface ComplianceDocsProps {
  docs: ComplianceDoc[];
  cecAccreditation?: string;
  electricalLicence?: string;
  insurance?: string;
  onUpdate: (data: Partial<ComplianceDocsData>) => void;
}

export interface ComplianceDoc {
  id: number;
  type: string;
  s3Key: string;
  fileName: string;
  uploadedAt: string;
}

export interface ComplianceDocsData {
  docs: ComplianceDoc[];
  cecAccreditation?: string;
  electricalLicence?: string;
  insurance?: string;
}

const DOC_TYPES = [
  { value: 'panel-datasheet', label: 'Panel Datasheet', mandatory: true },
  { value: 'inverter-datasheet', label: 'Inverter Datasheet', mandatory: true },
  { value: 'battery-datasheet', label: 'Battery Datasheet', mandatory: false },
  { value: 'panel-warranty', label: 'Panel Warranty Certificate', mandatory: true },
  { value: 'inverter-warranty', label: 'Inverter Warranty Certificate', mandatory: true },
  { value: 'battery-warranty', label: 'Battery Warranty Certificate', mandatory: false },
  { value: 'cec-accreditation', label: 'CEC Accreditation Certificate', mandatory: true },
  { value: 'electrical-licence', label: 'Electrical Licence', mandatory: true },
  { value: 'insurance', label: 'Public Liability Insurance', mandatory: true },
  { value: 'brochure', label: 'Product Brochure', mandatory: false }
];

const ComplianceDocs: React.FC<ComplianceDocsProps> = ({
  docs,
  cecAccreditation,
  electricalLicence,
  insurance,
  onUpdate
}) => {
  const getMandatoryStatus = () => {
    const mandatoryTypes = DOC_TYPES.filter((t) => t.mandatory).map((t) => t.value);
    const uploadedTypes = docs.map((d) => d.type);
    const missing = mandatoryTypes.filter((type) => !uploadedTypes.includes(type));
    return {
      total: mandatoryTypes.length,
      uploaded: mandatoryTypes.length - missing.length,
      missing
    };
  };

  const status = getMandatoryStatus();

  return (
    <div className="bg-background rounded-2xl shadow-neu-inset p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-heading-5 text-foreground flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          Compliance Documents
        </h3>
        <div className="text-body-small text-foreground">
          <span className={status.uploaded === status.total ? 'text-success' : 'text-warning'}>
            {status.uploaded}/{status.total}
          </span>{' '}
          mandatory docs uploaded
        </div>
      </div>

      {/* Missing Documents Alert */}
      {status.missing.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
          <p className="text-body-small text-foreground mb-2">
            <strong>Missing Mandatory Documents:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-body-small text-muted-foreground">
            {status.missing.map((type) => {
              const docType = DOC_TYPES.find((t) => t.value === type);
              return <li key={type}>{docType?.label}</li>;
            })}
          </ul>
        </div>
      )}

      {/* Installer Credentials */}
      <div className="space-y-4">
        <h4 className="text-body text-foreground">Installer Credentials</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-label text-foreground block mb-2">
              CEC Accreditation #
            </label>
            <input
              type="text"
              value={cecAccreditation || ''}
              onChange={(e) => onUpdate({ cecAccreditation: e.target.value })}
              placeholder="e.g. A1234567"
              className="form-input w-full px-4 py-3"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">
              Electrical Licence #
            </label>
            <input
              type="text"
              value={electricalLicence || ''}
              onChange={(e) => onUpdate({ electricalLicence: e.target.value })}
              placeholder="e.g. VIC123456"
              className="form-input w-full px-4 py-3"
            />
          </div>

          <div>
            <label className="text-label text-foreground block mb-2">
              Insurance Policy #
            </label>
            <input
              type="text"
              value={insurance || ''}
              onChange={(e) => onUpdate({ insurance: e.target.value })}
              placeholder="e.g. INS-98765"
              className="form-input w-full px-4 py-3"
            />
          </div>
        </div>
      </div>

      {/* Document Upload Grid */}
      <div className="space-y-4">
        <h4 className="text-body text-foreground">Document Uploads</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOC_TYPES.map((docType) => {
            const uploaded = docs.find((d) => d.type === docType.value);
            
            return (
              <div
                key={docType.value}
                className={`
                  border rounded-lg p-4 space-y-3
                  ${uploaded
                    ? 'border-success/30 bg-success/5'
                    : docType.mandatory
                    ? 'border-warning/30 bg-warning/5'
                    : 'border-border'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-small text-foreground">
                      {docType.label}
                      {docType.mandatory && (
                        <span className="text-error ml-1">*</span>
                      )}
                    </p>
                    {uploaded && (
                      <p className="text-caption text-muted-foreground mt-1">
                        {uploaded.fileName}
                      </p>
                    )}
                  </div>
                  {uploaded && (
                    <FileCheck className="h-5 w-5 text-success flex-shrink-0" />
                  )}
                </div>

                <Button
                  variant={uploaded ? 'secondary' : 'primary'}
                  className="w-full"
                  onClick={() => {
                    // Stub: File upload dialog
                    alert(`Upload ${docType.label} - Phase 3`);
                  }}
                >
                  <Upload className="h-4 w-4" />
                  {uploaded ? 'Replace' : 'Upload'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uploaded Documents List */}
      {docs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-body text-foreground">Uploaded Documents</h4>
          <div className="border border-border rounded-lg divide-y divide-border">
            {docs.map((doc) => {
              const docType = DOC_TYPES.find((t) => t.value === doc.type);
              return (
                <div key={doc.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-body-small text-foreground">{docType?.label || doc.type}</p>
                      <p className="text-caption text-muted-foreground">{doc.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-muted-foreground">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    <Button variant="minimal" className="h-8 w-8 p-0">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compliance Note */}
      <div className="bg-info/10 border border-info/30 rounded-lg p-4">
        <p className="text-body-small text-foreground">
          <strong>Note:</strong> All mandatory documents must be uploaded and verified before the quote can be finalized and sent to the customer. Documents are stored securely and are accessible for audit purposes.
        </p>
      </div>
    </div>
  );
};

export default ComplianceDocs;
