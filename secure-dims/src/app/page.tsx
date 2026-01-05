'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { IdentityCard } from '@/components/IdentityCard';
import { IdentityService } from '@/lib/services/identity';
import { CryptoProvider } from '@/lib/crypto/provider';
import { VerificationService } from '@/lib/services/verification';
import { ConsentService } from '@/lib/services/consent';
import { VerifierService } from '@/lib/services/verifier';
import { supabase } from '@/lib/supabase/client';
import { AuditService } from '@/lib/services/audit';

const AUTHORITY_ATTRIBUTES = ['institution', 'admin_check'];

export default function Home() {
  const [identity, setIdentity] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [verifyingAttr, setVerifyingAttr] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  // Verifier Console State
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([]);
  const [disclosureToken, setDisclosureToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);

  // Management State
  const [isAddingAttr, setIsAddingAttr] = useState(false);
  const [newAttr, setNewAttr] = useState({ name: '', value: '' });
  const [isRotating, setIsRotating] = useState(false);
  const [issuanceForm, setIssuanceForm] = useState({ fullName: '', email: '' });
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [isAssetMode, setIsAssetMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Editing State
  const [editingAttrId, setEditingAttrId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Verifier Playground State
  const [verifierInputToken, setVerifierInputToken] = useState('');
  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [isVerifyingInPlayground, setIsVerifyingInPlayground] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [attrToDelete, setAttrToDelete] = useState<any | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    // Auto-dismiss after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadIdentity = useCallback(async (did: string) => {
    setLoading(true);
    try {
      const data = await IdentityService.getIdentityByDID(did);
      setIdentity(data);
    } catch (err) {
      console.error('Failed to load identity', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLogs = useCallback(async (identityId: string) => {
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('identity_id', identityId)
        .order('created_at', { ascending: false });
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to load logs', err);
    }
  }, []);

  useEffect(() => {
    const savedDID = localStorage.getItem('ozoro_did');
    if (savedDID) {
      loadIdentity(savedDID);
    }
  }, [loadIdentity]);

  useEffect(() => {
    if (activeTab === 'audit' && identity) {
      loadLogs(identity.id);
    }
  }, [activeTab, identity, loadLogs]);

  const handleIssueIdentity = async () => {
    setIsIssuing(true);
    try {
      const { publicKey, privateKey } = await CryptoProvider.generateKeyPair();

      const result = await IdentityService.issueIdentity(null, publicKey, {
        fullName: issuanceForm.fullName || 'Anonymous User',
        email: issuanceForm.email || 'not-disclosed@example.com',
        phoneNumber: 'Not Provided',
        institution: 'Not Provided'
      });

      localStorage.setItem('ozoro_did', result.did);
      localStorage.setItem('ozoro_priv_key', privateKey);

      // Log the event
      await AuditService.logEvent(result.id, 'IDENTITY_ISSUED', {
        message: 'Decentralized identity successfully anchored and magic keys generated.'
      });

      await loadIdentity(result.did);
      showNotification('Identity Issued Successfully!', 'success');
    } catch (err: any) {
      console.error('Issuance failed', err);
      showNotification(err.message || 'Failed to issue identity.', 'error');
    } finally {
      setIsIssuing(false);
    }
  };

  const handleVerifyAttribute = async (attrName: string) => {
    if (!identity) return;
    setVerifyingAttr(attrName);
    try {
      await VerificationService.sendVerificationChallenge(identity.id, attrName);

      const isAuthority = AUTHORITY_ATTRIBUTES.includes(attrName);

      if (!isAuthority) {
        // Self-verification completes immediately (simulated OTP)
        const result = await VerificationService.completeVerification(identity.id, attrName);
        await AuditService.logEvent(identity.id, 'ATTRIBUTE_VERIFIED', {
          attribute: attrName,
          method: 'Self-Service OTP'
        });
        showNotification(`Verified ${attrName}! New Assurance Level: L${result.newTrustLevel}`, 'success');
      } else {
        // Authority verification requires admin approval
        await AuditService.logEvent(identity.id, 'VERIFICATION_REQUESTED', {
          attribute: attrName,
          level: 'L3/L4'
        });
        showNotification(`Verification request sent for ${attrName}. Awaiting Authority approval.`, 'info');
      }

      await loadIdentity(identity.did);
    } catch (err) {
      console.error('Verification failed', err);
      showNotification('Verification failed.', 'error');
    } finally {
      setVerifyingAttr(null);
    }
  };

  const handleGenerateToken = async () => {
    if (!identity || selectedAttrs.length === 0) return;
    setIsGeneratingToken(true);
    setVerificationResult(null);
    try {
      const privateKey = localStorage.getItem('ozoro_priv_key');
      if (!privateKey) throw new Error('Private key not found in storage');

      const { token } = await ConsentService.generateDisclosureToken(
        identity.id,
        privateKey,
        selectedAttrs
      );
      setDisclosureToken(token);
    } catch (err) {
      console.error('Token generation failed', err);
      showNotification('Failed to generate disclosure token.', 'error');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleSimulateVerification = async () => {
    if (!disclosureToken) return;
    setIsVerifyingToken(true);
    try {
      const result = await VerifierService.verifyDisclosureToken(disclosureToken);
      setVerificationResult(result);
    } catch (err) {
      console.error('Verification simulation failed', err);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const toggleAttribute = (name: string) => {
    setSelectedAttrs(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleAddAttribute = async () => {
    if (!identity || !newAttr.name || (!newAttr.value && !assetFile)) {
      showNotification('Please fill in both attribute name and value/file.', 'error');
      return;
    }

    setIsAddingAttr(true);
    setIsUploading(!!assetFile);

    try {
      let finalValue = newAttr.value;

      // Handle File Upload if present
      if (assetFile) {
        finalValue = await IdentityService.uploadAsset(assetFile, identity.id);
      }

      const { error } = await supabase
        .from('identity_attributes')
        .insert({
          identity_id: identity.id,
          attribute_name: newAttr.name,
          attribute_value: finalValue,
          verification_status: 'pending'
        });

      if (error) throw error;

      await AuditService.logEvent(identity.id, 'ATTRIBUTE_ADDED', {
        attribute: newAttr.name,
        value: finalValue,
        isAsset: !!assetFile
      });

      await loadIdentity(identity.did);
      setNewAttr({ name: '', value: '' });
      setAssetFile(null);
      setIsAssetMode(false);
      setIsAddingAttr(false);
      showNotification('Attribute added successfully!', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Failed to add attribute.', 'error');
    } finally {
      setIsAddingAttr(false);
      setIsUploading(false);
    }
  };

  const handleRotateKeys = async () => {
    if (!identity) return;
    setIsRotating(true);
    try {
      const { publicKey, privateKey } = await CryptoProvider.generateKeyPair();

      // Update the existing key record
      const { error } = await supabase
        .from('cryptographic_keys')
        .update({ public_key: publicKey })
        .eq('identity_id', identity.id);

      if (error) throw error;

      localStorage.setItem('ozoro_priv_key', privateKey);

      // Log the event
      await AuditService.logEvent(identity.id, 'KEY_ROTATION', {
        message: 'Cryptographic key pair rotated by holder for security refresh.'
      });

      showNotification('Keys rotated successfully! Your identity is now re-anchored.', 'success');
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Failed to rotate keys.', 'error');
    } finally {
      setIsRotating(false);
    }
  };

  const handleUpdateAttribute = async (id: string) => {
    if (!editingValue) return;
    try {
      await IdentityService.updateAttribute(id, editingValue);
      await AuditService.logEvent(identity!.id, 'ATTRIBUTE_UPDATED', {
        attribute_id: id,
        new_value: editingValue
      });
      showNotification('Attribute updated!', 'success');
      setEditingAttrId(null);
      if (identity) await loadIdentity(identity.did);
    } catch (err) {
      console.error(err);
      showNotification('Update failed.', 'error');
    }
  };

  const handleDeleteAttribute = (attr: any) => {
    setAttrToDelete(attr);
  };

  const confirmDelete = async () => {
    if (!attrToDelete) return;
    try {
      await IdentityService.deleteAttribute(attrToDelete.id);
      await AuditService.logEvent(identity!.id, 'ATTRIBUTE_DELETED', {
        attribute: attrToDelete.attribute_name
      });
      showNotification('Attribute deleted.', 'success');
      setAttrToDelete(null);
      if (identity) await loadIdentity(identity.did);
    } catch (err) {
      console.error(err);
      showNotification('Delete failed.', 'error');
    }
  };

  const handleApproveAttribute = async (id: string, status: 'verified' | 'rejected' | 'unverified') => {
    try {
      const { error } = await supabase
        .from('identity_attributes')
        .update({
          verification_status: status,
          verified_at: status === 'verified' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      await AuditService.logEvent(identity!.id,
        status === 'verified' ? 'ATTRIBUTE_VERIFIED' :
          status === 'rejected' ? 'VERIFICATION_REJECTED' : 'VERIFICATION_REVOKED',
        { attribute_id: id }
      );

      let message = `Attribute ${status}!`;
      if (status === 'unverified') message = 'Verification revoked successfully.';

      showNotification(message, status === 'verified' ? 'success' : 'info');
      if (identity) await loadIdentity(identity.did);
    } catch (err) {
      console.error(err);
      showNotification('Operation failed.', 'error');
    }
  };

  const handleExportIdentity = () => {
    if (!identity) return;

    const didDocument = {
      "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/suites/jws-2020/v1"],
      "id": identity.did,
      "verificationMethod": [{
        "id": `${identity.did}#keys-1`,
        "type": "JsonWebKey2020",
        "controller": identity.did,
        "publicKeyJwk": identity.cryptographic_keys?.[0]?.public_key // Assuming the public key is stored in a format compatible with JWK for the demo
      }],
      "authentication": [`${identity.did}#keys-1`],
      "assertionMethod": [`${identity.did}#keys-1`]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(didDocument, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `did_document_ozoro_${identity.did.split(':').pop()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    showNotification('DID Document exported successfully!', 'success');
    AuditService.logEvent(identity.id, 'CONSENT_GRANTED', { message: 'Identity document exported by holder.' });
  };

  const handlePlaygroundVerify = async () => {
    if (!verifierInputToken) return;
    setIsVerifyingInPlayground(true);
    setPlaygroundResult(null);
    try {
      const result = await VerifierService.verifyDisclosureToken(verifierInputToken);
      setPlaygroundResult(result);
      showNotification('Token verified successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      setPlaygroundResult({ verified: false, error: err.message });
      showNotification('Verification failed.', 'error');
    } finally {
      setIsVerifyingInPlayground(false);
    }
  };

  const renderIssuerPortal = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="premium-card p-8 border border-card-border overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold">Verification Request Queue</h3>
            <p className="text-sm text-zinc-500">Review and approve attribute verification requests as an Authority.</p>
          </div>
          <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded-full">Admin View</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-card-border">
                <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Type</th>
                <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Claim Value</th>
                <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Current Status</th>
                <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {identity.identity_attributes?.map((attr: any) => (
                <tr key={attr.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="py-4">
                    <p className="text-sm font-bold capitalize">{attr.attribute_name.replace(/([A-Z])/g, ' $1').replace('_', ' ')}</p>
                  </td>
                  <td className="py-4">
                    {attr.attribute_value && (attr.attribute_value.startsWith('http') && (attr.attribute_value.match(/\.(jpeg|jpg|gif|png)$/) || attr.attribute_value.includes('identity-assets'))) ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-card-border bg-zinc-100">
                          <img src={attr.attribute_value} alt={attr.attribute_name} className="w-full h-full object-cover" />
                        </div>
                        <a href={attr.attribute_value} target="_blank" rel="noreferrer" className="text-[10px] text-accent font-bold hover:underline">View Proof</a>
                      </div>
                    ) : (
                      <p className="text-xs font-mono opacity-60">{attr.attribute_value}</p>
                    )}
                  </td>
                  <td className="py-4 text-center">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${attr.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
                      attr.verification_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                      {attr.verification_status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {attr.verification_status === 'verified' ? (
                      <button
                        onClick={() => handleApproveAttribute(attr.id, 'unverified')}
                        className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-100 border border-red-100 transition-colors"
                      >
                        Revoke Verification
                      </button>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveAttribute(attr.id, 'verified')}
                          className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproveAttribute(attr.id, 'rejected')}
                          className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold rounded-lg hover:bg-zinc-300 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {(!identity.identity_attributes || identity.identity_attributes.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-zinc-400 italic">No verification requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderVerifierPlayground = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
      <div className="premium-card p-8 border border-card-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xl">🔍</div>
          <div>
            <h3 className="text-xl font-bold">Proof Submission</h3>
            <p className="text-sm text-zinc-500 text-balance">Paste a signed identity token to verify its authenticity.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-left">
            <label className="text-[10px] uppercase font-bold text-zinc-400 ml-1 mb-2 block">Disclosure Token (JWT/JWS)</label>
            <textarea
              className="w-full h-48 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-card-border rounded-xl font-mono text-[10px] text-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
              placeholder="Paste token here..."
              value={verifierInputToken}
              onChange={(e) => setVerifierInputToken(e.target.value)}
            />
          </div>

          <button
            onClick={handlePlaygroundVerify}
            disabled={!verifierInputToken || isVerifyingInPlayground}
            className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-zinc-900/10"
          >
            {isVerifyingInPlayground ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : 'Verify Signature & Claims'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {playgroundResult ? (
          <div className="premium-card p-8 border border-card-border animate-in zoom-in-95 duration-500">
            <div className={`flex items-center gap-4 mb-8 p-4 rounded-2xl border ${playgroundResult.verified ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm ${playgroundResult.verified ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {playgroundResult.verified ? '✓' : '✗'}
              </div>
              <div>
                <h4 className={`text-lg font-bold ${playgroundResult.verified ? 'text-green-800' : 'text-red-800'}`}>
                  {playgroundResult.verified ? 'Valid Proof' : 'Invalid Proof'}
                </h4>
                <p className={`text-xs font-medium ${playgroundResult.verified ? 'text-green-800/70' : 'text-red-800/70'}`}>
                  {playgroundResult.verified ? 'Cryptographic signature is authentic.' : playgroundResult.error}
                </p>
              </div>
            </div>

            {playgroundResult.verified && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Decoded Attributes</p>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.keys(playgroundResult.claims).map(key => (
                      <div key={key} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-card-border">
                        <div>
                          <p className="text-[9px] text-accent font-bold uppercase tracking-widest">{key}</p>
                          {(playgroundResult.claims[key].value?.startsWith('http') && (playgroundResult.claims[key].value.match(/\.(jpeg|jpg|gif|png)$/) || playgroundResult.claims[key].value.includes('identity-assets'))) ? (
                            <div className="mt-1 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-card-border bg-zinc-100">
                                <img src={playgroundResult.claims[key].value} alt={key} className="w-full h-full object-cover" />
                              </div>
                              <a href={playgroundResult.claims[key].value} target="_blank" rel="noreferrer" className="text-[10px] text-accent font-bold hover:underline">View Asset</a>
                            </div>
                          ) : (
                            <p className="text-sm font-bold mt-0.5">{playgroundResult.claims[key].value}</p>
                          )}
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${playgroundResult.claims[key].verified ? 'text-green-600 bg-green-100' : 'text-zinc-500 bg-zinc-100'}`}>
                          {playgroundResult.claims[key].verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-card-border">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Technical Audit</p>
                  <div className="p-3 bg-zinc-900 rounded-lg">
                    <p className="text-[9px] font-mono text-zinc-500 break-all">{playgroundResult.auditTrail}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="premium-card p-12 border border-dashed border-card-border flex flex-col items-center justify-center text-center h-full opacity-60">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-card-border flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">⚖️</div>
            <h4 className="font-bold mb-2">Results Panel</h4>
            <p className="text-xs text-zinc-500 max-w-[200px]">Submission results will appear here after cryptographic processing.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderVerifierConsole = () => (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="premium-card p-10 border border-card-border">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold">Selective Disclosure</h3>
            <p className="text-sm text-zinc-500 mt-1">Choose which verified claims to share with an external party.</p>
          </div>
          <div className="text-4xl">🔐</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {identity.identity_attributes?.map((attr: any) => (
            <div
              key={attr.id}
              onClick={() => toggleAttribute(attr.attribute_name)}
              className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAttrs.includes(attr.attribute_name)
                ? 'bg-accent/5 border-accent shadow-md scale-[1.02]'
                : 'border-card-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${selectedAttrs.includes(attr.attribute_name) ? 'bg-accent border-accent text-white' : 'border-zinc-300 dark:border-zinc-700'
                  }`}>
                  {selectedAttrs.includes(attr.attribute_name) && <CheckSmallIcon />}
                </div>
                {(attr.attribute_value && (attr.attribute_value.startsWith('http') && (attr.attribute_value.match(/\.(jpeg|jpg|gif|png)$/) || attr.attribute_value.includes('identity-assets')))) ? (
                  <div className="w-8 h-8 rounded-md overflow-hidden border border-card-border bg-zinc-100 shrink-0">
                    <img src={attr.attribute_value} alt={attr.attribute_name} className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <span className="font-bold capitalize">{attr.attribute_name.replace(/([A-Z])/g, ' $1').replace('_', ' ')}</span>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${attr.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
                }`}>
                {attr.verification_status}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGenerateToken}
            disabled={selectedAttrs.length === 0 || isGeneratingToken}
            className="w-full py-4 bg-accent text-white rounded-2xl font-bold text-lg disabled:opacity-50 shadow-xl shadow-accent/20 hover:scale-[1.01] transition-transform"
          >
            {isGeneratingToken ? 'Cryptographically Signing...' : 'Generate New Identity Proof (JWS)'}
          </button>

          {disclosureToken && (
            <div className="animate-in slide-in-from-top-4 duration-500">
              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Signed Identity Token</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(disclosureToken); showNotification('Token copied!', 'info'); }}
                    className="text-[10px] font-bold text-accent hover:underline"
                  >
                    Copy Token
                  </button>
                </div>
                <div className="text-[10px] font-mono text-accent break-all leading-relaxed p-4 bg-black/40 rounded-xl border border-white/5 max-h-40 overflow-y-auto">
                  {disclosureToken}
                </div>
              </div>
              <p className="mt-4 text-xs text-center text-zinc-500">
                🚀 **Next Step:** Copy this token and paste it into the **Verifier Playground** tab to simulate external verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <IdentityCard
            did={identity.did}
            trustLevel={`L${identity.security_level}` as any}
            status={identity.is_active ? 'Active' : 'Suspended'}
          />
        </div>

        <div className="lg:col-span-2 premium-card p-8 flex flex-col justify-between border border-card-border">
          <div>
            <h3 className="text-xl font-bold mb-6">Verification Progress</h3>
            <div className="space-y-4">
              {identity.identity_attributes?.map((attr: any) => (
                <VerificationItem
                  key={attr.id}
                  label={attr.attribute_name}
                  status={attr.verification_status.charAt(0).toUpperCase() + attr.verification_status.slice(1)}
                  value={attr.attribute_value}
                  onVerify={() => handleVerifyAttribute(attr.attribute_name)}
                  isVerifying={verifyingAttr === attr.attribute_name}
                />
              ))}
              {(!identity.identity_attributes || identity.identity_attributes.length === 0) && (
                <p className="text-zinc-500 italic text-sm">No attributes found for this identity.</p>
              )}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-card-border flex items-center justify-between">
            <p className="text-sm text-zinc-500 font-medium">
              {identity.security_level < 4
                ? `Next: Complete more verifications to reach L${identity.security_level + 1}`
                : 'Maximum Trust Level (L4) Achieved'}
            </p>
            <button onClick={() => setActiveTab('attributes')} className="text-accent text-sm font-bold hover:underline">Complete Profiling →</button>
          </div>
        </div>
      </div>

      <section>
        <h3 className="text-xl font-bold mb-6">Security Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard title="Secure Vault" desc="Encrypted storage for your keys." icon="🔒" />
          <FeatureCard title="Trust Engine" desc={`Assurance Level: L${identity.security_level}`} icon="🚀" />
          <FeatureCard title="Consent Hub" desc="Manage data sharing permissions." icon="🤝" />
          <FeatureCard title="Audit Logs" icon="📜" desc="View your recent interactions." />
        </div>
      </section>

      <section className="premium-card p-8 border border-card-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Recent Activity</h3>
          <button onClick={() => setActiveTab('audit')} className="text-sm text-accent font-medium">View All</button>
        </div>
        <div className="space-y-6">
          <ActivityItem
            title="Identity Anchored"
            time="System"
            desc={`DID ${identity.did.substring(0, 15)}... was successfully registered.`}
            type="success"
          />
          {identity.security_level > 1 && (
            <ActivityItem
              title="Trust Escalation"
              time="Engine"
              desc={`Identity level increased to L${identity.security_level}.`}
              type="info"
            />
          )}
        </div>
      </section>
    </>
  );

  const renderAttributes = () => (
    <div className="space-y-8">
      <div className="premium-card p-8 border border-card-border">
        <h3 className="text-xl font-bold mb-6">Identity Attributes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {identity.identity_attributes?.map((attr: any) => (
            <div key={attr.id} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-card-border flex flex-col justify-between h-52 transition-all hover:shadow-lg group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">{attr.attribute_name.replace(/([A-Z])/g, ' $1').replace('_', ' ')}</p>
                  {editingAttrId === attr.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        className="bg-white dark:bg-zinc-800 border border-accent/20 rounded-md px-2 py-1 text-sm w-full outline-none ring-2 ring-accent/10"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => handleUpdateAttribute(attr.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">✓</button>
                      <button onClick={() => setEditingAttrId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded">✕</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-2">
                      {attr.attribute_value && (attr.attribute_value.startsWith('http') && (attr.attribute_value.match(/\.(jpeg|jpg|gif|png)$/) || attr.attribute_value.includes('identity-assets'))) ? (
                        <div className="w-24 h-16 rounded-lg overflow-hidden border border-card-border bg-zinc-100 dark:bg-zinc-800 group/img relative">
                          <img src={attr.attribute_value} alt={attr.attribute_name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <a href={attr.attribute_value} target="_blank" rel="noreferrer" className="text-[10px] text-white font-bold hover:underline">View Full</a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2 group/val">
                          <p className="font-mono text-sm font-bold opacity-90 truncate max-w-[180px]">{attr.attribute_value}</p>
                          <button
                            onClick={() => { setEditingAttrId(attr.id); setEditingValue(attr.attribute_value); }}
                            className="opacity-0 group-hover/val:opacity-100 transition-opacity p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-400"
                            title="Edit Value"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${attr.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {attr.verification_status}
                  </span>
                  <button
                    onClick={() => handleDeleteAttribute(attr)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl"
                    title="Delete Attribute"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                  </button>
                </div>
              </div>

              <div className="mt-4">
                {attr.verification_status !== 'verified' ? (
                  <button
                    disabled={verifyingAttr === attr.attribute_name}
                    onClick={() => handleVerifyAttribute(attr.attribute_name)}
                    className="w-full py-2.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-accent/20 transition-all disabled:opacity-50"
                  >
                    {verifyingAttr === attr.attribute_name ? 'Verifying...' : 'Submit to Trust Engine →'}
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2.5 bg-green-50 dark:bg-green-900/10 text-green-600 rounded-xl">
                    <CheckSmallIcon />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verified Cryptographically</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 rounded-2xl border border-dashed border-card-border flex flex-col items-center justify-center min-h-[176px]">
          {isAddingAttr ? (
            <div className="w-full space-y-4">
              <div className="text-left">
                <label className="text-[10px] uppercase font-bold text-zinc-400 ml-1 mb-1 block">Attribute Type (e.g. Nationality)</label>
                <input
                  type="text"
                  placeholder="Enter type..."
                  className="w-full px-3 py-2 text-sm border border-card-border rounded-xl bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-accent/10 outline-none transition-all"
                  value={newAttr.name}
                  onChange={(e) => setNewAttr({ ...newAttr, name: e.target.value })}
                />
              </div>
              <div className="text-left">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 ml-1 block">Claim Value / Asset</label>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-card-border overflow-hidden">
                    <button
                      onClick={() => { setIsAssetMode(false); setAssetFile(null); }}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${!isAssetMode ? 'bg-white dark:bg-zinc-700 shadow-sm text-accent' : 'text-zinc-500'}`}
                    >
                      Text
                    </button>
                    <button
                      onClick={() => { setIsAssetMode(true); setNewAttr({ ...newAttr, value: '' }); }}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${isAssetMode ? 'bg-white dark:bg-zinc-700 shadow-sm text-accent' : 'text-zinc-500'}`}
                    >
                      File
                    </button>
                  </div>
                </div>

                {!isAssetMode ? (
                  <input
                    type="text"
                    placeholder="Enter value..."
                    className="w-full px-3 py-2 text-sm border border-card-border rounded-xl bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-accent/10 outline-none transition-all"
                    value={newAttr.value}
                    onChange={(e) => setNewAttr({ ...newAttr, value: e.target.value })}
                  />
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      id="asset-upload"
                      className="hidden"
                      onChange={(e) => setAssetFile(e.target.files?.[0] || null)}
                      accept="image/*"
                    />
                    <label
                      htmlFor="asset-upload"
                      className="w-full px-3 py-2 text-sm border border-dashed border-accent/40 rounded-xl bg-accent/5 hover:bg-accent/10 cursor-pointer flex items-center justify-center gap-2 transition-all"
                    >
                      <span>📎</span>
                      <span className="font-medium text-accent">
                        {assetFile ? assetFile.name : 'Select ID Card / Photo'}
                      </span>
                    </label>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddAttribute}
                  className="flex-grow py-3 bg-accent text-white text-xs font-bold rounded-xl shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform"
                >
                  Save Attribute
                </button>
                <button
                  onClick={() => setIsAddingAttr(false)}
                  className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-bold rounded-xl hover:bg-zinc-200"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingAttr(true)}
              className="text-zinc-400 font-medium hover:text-accent transition-colors"
            >
              + Add New Attribute
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className="premium-card p-8 border border-card-border">
      <h3 className="text-xl font-bold mb-8">System Audit Trail</h3>
      <div className="space-y-8 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-6 relative pl-8">
            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-background ${log.event_type.includes('success') ? 'bg-green-500' : 'bg-accent'
              }`} />
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm tracking-tight">{log.event_type.replace(/_/g, ' ').toUpperCase()}</p>
                <p className="text-[10px] text-zinc-400">{new Date(log.created_at).toLocaleString()}</p>
              </div>
              <p className="text-sm text-zinc-500 mt-1">{log.details?.message || 'Security event recorded.'}</p>
              <p className="text-[10px] font-mono mt-2 opacity-50">TX: {log.id}</p>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center py-20 text-zinc-400 italic">No activity logs found for this identity.</div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-accent mb-2">
              {identity ? `Welcome Back` : 'Get Started'}
            </h2>
            <h1 className="text-4xl font-bold tracking-tight">
              {identity ? (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) : 'Secure Digital Identity'}
            </h1>
            <p className="text-zinc-500 mt-2">
              {identity
                ? `Managing your ${activeTab} and cryptographic assets.`
                : 'Create your unique digital identity anchored on the Ozoro platform.'}
            </p>
          </div>

          {!identity && (
            <button
              onClick={handleIssueIdentity}
              disabled={isIssuing}
              className="px-6 py-3 bg-accent text-white rounded-full font-medium hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 cursor-pointer disabled:opacity-50"
            >
              {isIssuing ? 'Issuing...' : 'Issue New Identity'}
            </button>
          )}
        </section>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : identity ? (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'attributes' && renderAttributes()}
            {activeTab === 'verifications' && renderVerifierConsole()}
            {activeTab === 'issuer-portal' && renderIssuerPortal()}
            {activeTab === 'verifier-playground' && renderVerifierPlayground()}
            {activeTab === 'audit' && renderAudit()}
            {activeTab === 'settings' && (
              <div className="premium-card p-12 text-center border border-card-border animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-2xl bg-accent text-white flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-accent/20">⚙️</div>
                <h3 className="text-2xl font-bold mb-4">Security Settings</h3>
                <p className="text-zinc-500 mb-8 max-w-md mx-auto">Manage your DID documents and private key export options. All cryptographic operations are performed on-device.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleExportIdentity}
                    className="px-8 py-3 bg-white dark:bg-zinc-800 border border-card-border rounded-xl font-bold text-sm hover:shadow-md transition-shadow"
                  >
                    Download JSON DID Document
                  </button>
                  <div className="relative group/rotate">
                    <button
                      onClick={handleRotateKeys}
                      disabled={isRotating}
                      className="w-full px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {isRotating ? 'Rotating...' : 'Rotate Magic Keys'}
                    </button>
                    <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 text-[10px] bg-zinc-800 text-zinc-300 p-2 rounded-lg opacity-0 group-hover/rotate:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-white/5">
                      Recommended if you suspect your device is compromised. Generates new cryptographic keys while keeping your DID.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="premium-card p-12 text-center border border-dashed border-card-border animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-accent/5 flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">🪪</div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight">Identity Setup Required</h3>
            <p className="text-zinc-500 max-w-lg mx-auto text-base leading-relaxed mb-10">
              Welcome to <strong>OZORO Secure DIMS</strong>. This platform uses the <strong>Self-Sovereign Identity (SSI)</strong> model.
              There are no passwords stored on our servers. Instead, you control your identity through unique cryptographic keys generated right here in your browser.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto mb-12">
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-card-border">
                <div className="text-xl mb-3">🔑</div>
                <h4 className="font-bold mb-2">1. Key Generation</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">RSA-PSS key pairs are generated on your device. Your private key never leaves your browser.</p>
              </div>
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-card-border">
                <div className="text-xl mb-3">⚓</div>
                <h4 className="font-bold mb-2">2. DID Anchoring</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">Your Decentralized Identifier (DID) is registered on the platform with your public key as proof of ownership.</p>
              </div>
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-card-border">
                <div className="text-xl mb-3">🛡️</div>
                <h4 className="font-bold mb-2">3. Verified Claims</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">Starting with L1, you can add and verify attributes to increase your global Trust Assurance Level.</p>
              </div>
            </div>

            <div className="max-w-md mx-auto mb-10 space-y-4">
              <div className="text-left">
                <label className="text-[10px] uppercase font-bold text-zinc-400 ml-4 mb-1 block">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border border-card-border rounded-2xl focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  value={issuanceForm.fullName}
                  onChange={(e) => setIssuanceForm({ ...issuanceForm, fullName: e.target.value })}
                />
              </div>
              <div className="text-left">
                <label className="text-[10px] uppercase font-bold text-zinc-400 ml-4 mb-1 block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. john@ozoro.edu"
                  className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border border-card-border rounded-2xl focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  value={issuanceForm.email}
                  onChange={(e) => setIssuanceForm({ ...issuanceForm, email: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={handleIssueIdentity}
              disabled={isIssuing || !issuanceForm.fullName || !issuanceForm.email}
              className="px-12 py-4 bg-accent text-white rounded-full font-bold text-lg hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 cursor-pointer disabled:opacity-50"
            >
              {isIssuing ? 'Generating Vault...' : 'Issue My Digital Identity'}
            </button>
            <p className="mt-6 text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Anchored on the OZORO Protocol</p>
          </div>
        )}

        {/* Custom Delete Confirmation Modal */}
        {attrToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="premium-card max-w-sm w-full p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto mb-6">🗑️</div>
              <h3 className="text-xl font-bold text-center mb-2">Delete Attribute?</h3>
              <p className="text-sm text-zinc-500 text-center mb-8 leading-relaxed">
                Are you sure you want to remove <strong>{attrToDelete.attribute_name.replace('_', ' ')}</strong>? This action will also invalidate any existing proofs using this claim.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmDelete}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Yes, Delete Forever
                </button>
                <button
                  onClick={() => setAttrToDelete(null)}
                  className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {notification && (
          <div className={`fixed bottom-8 right-8 z-50 animate-in slide-in-from-right duration-300 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${notification.type === 'success' ? 'bg-green-600 border-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-600 border-red-500 text-white' :
              'bg-zinc-900 border-zinc-800 text-white'
            }`}>
            <span className="text-xl">{notification.type === 'success' ? '✓' : notification.type === 'error' ? '⚠' : 'ℹ'}</span>
            <p className="font-bold text-sm tracking-tight">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">✕</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const VerificationItem = ({ label, status, value, onVerify, isVerifying }: any) => {
  const isAuthority = AUTHORITY_ATTRIBUTES.includes(label);
  const isImage = value && (value.startsWith('http') && (value.match(/\.(jpeg|jpg|gif|png)$/) || value.includes('identity-assets')));

  return (
    <div className="flex items-center justify-between py-3 border-b border-card-border last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors px-2 rounded-lg group">
      <div className="flex items-center gap-4">
        {isImage ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-card-border bg-zinc-100 dark:bg-zinc-800">
            <img src={value} alt={label} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xl italic font-serif">
            {label.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-bold capitalize">{label.replace(/([A-Z])/g, ' $1').replace('_', ' ')}</p>
          {value && !isImage && <p className="text-xs text-zinc-500">{value}</p>}
          {isImage && <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Asset: {value.split('/').pop()?.substring(0, 15)}...</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {status !== 'Verified' && status !== 'Pending' && (
          <button
            onClick={onVerify}
            disabled={isVerifying}
            className="text-[10px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          >
            {isVerifying ? 'Processing...' : isAuthority ? 'Request Verification →' : 'Verify Now →'}
          </button>
        )}
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${status === 'Verified' ? 'bg-green-100 text-green-700' :
          status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'
          }`}>
          {status}
        </span>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, desc, icon }: any) => (
  <div className="premium-card p-6 border border-card-border group hover:border-accent/40 bg-zinc-50/50 dark:bg-zinc-900/50">
    <div className="text-2xl mb-4 group-hover:scale-110 transition-transform origin-left">{icon}</div>
    <h4 className="font-bold mb-1">{title}</h4>
    <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
  </div>
);

const ActivityItem = ({ title, time, desc, type }: any) => (
  <div className="flex gap-4">
    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${type === 'success' ? 'bg-green-500' : type === 'info' ? 'bg-accent' : 'bg-zinc-300'
      }`} />
    <div>
      <div className="flex items-center gap-3">
        <p className="text-sm font-bold">{title}</p>
        <span className="text-[10px] text-zinc-400 font-medium uppercase">{time}</span>
      </div>
      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);
const CheckSmallIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
