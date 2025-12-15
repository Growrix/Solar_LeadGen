'use client'

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Message, Conversation } from '../types';

// --- Icon Components ---
const XIcon = ({ className ="h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>;
const SearchIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const StarIcon = ({ filled = false, className ="h-4 w-4" }: { filled?: boolean; className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ?"currentColor" :"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>;
const MoreVerticalIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const SendIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>;
const SmileIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>;
const PaperclipIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
const CheckIcon = ({ className ="h-3 w-3" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>;
const CheckCheckIcon = ({ className ="h-3 w-3" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>;
const PinIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 7.89 17H16.1a2 2 0 0 0 1.78-2.55l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 0-1-1H10a1 1 0 0 0-1 1Z"/></svg>;
const BlockIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>;
const FlagIcon = ({ className ="h-4 w-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>;
const MenuIcon = ({ className ="h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>;
const ArrowLeftIcon = ({ className ="h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;

// --- Types ---
interface Homeowner {
    id: number;
    name: string;
    avatar: string;
    online: boolean;
    lastSeen?: Date;
}

// Re-defining Conversation for installer context
interface InstallerConversation {
  id: number;
  homeowner: Homeowner;
  messages: Message[];
  unreadCount: number;
  pinned: boolean;
  starred: boolean;
  lastMessage: Date;
  isTyping: boolean;
}

interface InstallerMessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallerMessagingModal: React.FC<InstallerMessagingModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileInbox, setShowMobileInbox] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- MOCK DATA FOR INSTALLER ---
  const [conversations, setConversations] = useState<InstallerConversation[]>([
    {
      id: 1,
      homeowner: { id: 101, name: 'Jane Doe', avatar: 'https://picsum.photos/seed/user1/100/100', online: true },
      messages: [
        { id: 1, senderId: 101, content: 'Hi, I received your quote. Can you tell me more about the warranty?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'text', read: true, sent: true },
        { id: 2, senderId: 1, content: 'Of course! Our panels come with a 25-year performance warranty and the inverter has a 10-year warranty.', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), type: 'text', read: true, sent: true },
        { id: 3, senderId: 101, content: 'That sounds great. What about installation time?', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), type: 'text', read: false, sent: true }
      ],
      unreadCount: 1, pinned: true, starred: true, lastMessage: new Date(Date.now() - 1 * 60 * 60 * 1000), isTyping: true
    },
    {
      id: 2,
      homeowner: { id: 102, name: 'John Smith', avatar: 'https://picsum.photos/seed/user2/100/100', online: false, lastSeen: new Date(Date.now() - 45 * 60 * 1000) },
      messages: [
        { id: 4, senderId: 1, content: 'Hello John, I\'ve attached the revised quote with the battery option included. Let me know what you think.', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), type: 'text', read: true, sent: true },
        { id: 5, senderId: 102, content: 'Thanks, I\'ll review it this evening.', timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000), type: 'text', read: true, sent: true }
      ],
      unreadCount: 0, pinned: false, starred: false, lastMessage: new Date(Date.now() - 3.5 * 60 * 60 * 1000), isTyping: false
    }
  ]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const activeConv = conversations.find(c => c.id === activeConversation);

  const filteredConversations = conversations
    .filter(c => filter === 'all' || (filter === 'unread' && c.unreadCount > 0))
    .filter(c => c.homeowner.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : -1) || b.lastMessage.getTime() - a.lastMessage.getTime());

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    const newMsg: Message = { id: Date.now(), senderId: 1, content: newMessage.trim(), timestamp: new Date(), type: 'text', read: false, sent: true };
    setConversations(prev => prev.map(c => c.id === activeConversation ? { ...c, messages: [...c.messages, newMsg], lastMessage: new Date() } : c));
    setNewMessage('');
  };

  useEffect(() => {
    chatAreaRef.current?.scrollTo(0, chatAreaRef.current.scrollHeight);
  }, [activeConv?.messages]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-6xl h-[90vh] mx-4 bg-surface rounded-none sm:rounded-2xl shadow-2xl animate-scale-in overflow-hidden flex" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        <div className="md:hidden absolute top-4 left-4 z-10">{!showMobileInbox && <button onClick={() => setShowMobileInbox(true)} className="p-2 rounded-lg bg-surface"><ArrowLeftIcon /></button>}</div>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-surface"><XIcon /></button>
        <div className={`${showMobileInbox ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 flex-col bg-surface border-r border-border`}>
          <div className="p-6 border-b border-border">
            <h2 className="text-heading-3 text-foreground mb-4">Messages</h2>
            <div className="relative mb-3"><SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input type="text" placeholder="Search homeowners..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-body-small focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div className="flex space-x-1">{(['all', 'unread', 'archived'] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-caption rounded-md ${filter === f ? 'bg-primary text-foreground-secondary' : 'text-muted'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}</div>
          </div>
          <div className="flex-1 overflow-y-auto">{filteredConversations.map(c => (
            <div key={c.id} onClick={() => { setActiveConversation(c.id); setShowMobileInbox(false); }} className={`p-4 border-b border-border cursor-pointer ${activeConversation === c.id ? 'bg-surface border-r-2 border-r-primary' : ''}`}>
              <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0"><Image src={c.homeowner.avatar} alt={c.homeowner.name} width={40} height={40} className="rounded-full" />{c.homeowner.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-white rounded-full" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between"><h4 className="text-label text-foreground truncate">{c.homeowner.name}</h4><span className="text-caption text-muted">{formatTime(c.lastMessage)}</span></div>
                  <p className="text-body-small text-muted truncate mt-0.5">{c.isTyping ? <span className="text-success italic">Typing...</span> : c.messages[c.messages.length - 1]?.content}</p>
                  {c.unreadCount > 0 && <div className="flex justify-end mt-1"><span className="w-5 h-5 text-caption text-foreground-secondary bg-primary rounded-full flex items-center justify-center">{c.unreadCount}</span></div>}
                </div>
              </div>
            </div>
          ))}</div>
        </div>
        <div className={`${!showMobileInbox ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>{activeConv ? (
          <>
            <div className="p-4 border-b border-border bg-surface">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative"><Image src={activeConv.homeowner.avatar} alt={activeConv.homeowner.name} width={40} height={40} className="rounded-full" />{activeConv.homeowner.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-white rounded-full" />}</div>
                  <div><h3 className="text-foreground">{activeConv.homeowner.name}</h3><p className="text-body-small text-muted">{activeConv.homeowner.online ? 'Online' : `Last seen ${activeConv.homeowner.lastSeen ? formatTime(activeConv.homeowner.lastSeen) : 'awhile ago'}`}</p></div>
                </div>
                <div className="flex items-center space-x-2"><button className="p-2 rounded-lg text-muted"><StarIcon /></button><div className="relative"><button onClick={() => setDropdownOpen(dropdownOpen === activeConv.id ? null : activeConv.id)} className="p-2 rounded-lg text-muted"><MoreVerticalIcon /></button>{dropdownOpen === activeConv.id && <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg shadow-lg z-10"><button className="w-full px-4 py-2 text-left text-body-small text-foreground flex items-center space-x-2"><PinIcon /><span>Pin Conversation</span></button><button className="w-full px-4 py-2 text-left text-body-small text-foreground flex items-center space-x-2"><BlockIcon /><span>Block Homeowner</span></button><button className="w-full px-4 py-2 text-left text-body-small text-error flex items-center space-x-2"><FlagIcon /><span>Report</span></button></div>}</div></div>
              </div>
            </div>
            <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface">
              {activeConv.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === 1 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${msg.senderId === 1 ? 'order-2' : 'order-1'}`}>
                    <div className={`px-4 py-2 rounded-2xl ${msg.senderId === 1 ? 'bg-primary text-foreground-secondary rounded-br-md' : 'bg-surface text-foreground rounded-bl-md border border-border'}`}>
                      <p className="text-body-small">{msg.content}</p>
                    </div>
                    <div className={`flex items-center mt-1 space-x-1 ${msg.senderId === 1 ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-caption text-muted">{formatTime(msg.timestamp)}</span>
                      {msg.senderId === 1 && <div className="text-muted">{msg.read ? <CheckCheckIcon className="text-primary" /> : <CheckIcon />}</div>}
                    </div>
                  </div>
                </div>
              ))}
              {activeConv.isTyping && <div className="flex justify-start"><div className="bg-surface px-4 py-3 rounded-2xl"><div className="flex space-x-1"><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} /></div></div></div>}
            </div>
            <div className="p-4 bg-surface border-t border-border">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="Type your message..." rows={1} className="w-full px-4 py-3 pr-20 bg-surface rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary text-body-small" />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-1"><button className="p-1.5 rounded-lg text-muted"><SmileIcon /></button><button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg text-muted"><PaperclipIcon /></button></div>
                </div>
                <button onClick={handleSendMessage} disabled={!newMessage.trim()} className={`p-3 rounded-xl ${newMessage.trim() ? 'bg-primary text-foreground-secondary' : 'bg-gray-200 text-muted'}`}><SendIcon /></button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">{["Quote attached.","Does that time work?","Happy to help!","Let me know if you have questions."].map(reply => <button key={reply} onClick={() => setNewMessage(reply)} className="px-3 py-1.5 text-body-small bg-surface text-muted rounded-full">{reply}</button>)}</div>
              <input ref={fileInputRef} type="file" multiple className="hidden" />
            </div>
          </>
        ) : (<div className="flex-1 flex items-center justify-center bg-surface"><div className="text-center"><div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"><MenuIcon /></div><h3 className="text-heading-4 text-foreground">Select a Conversation</h3><p className="text-muted">Choose a homeowner to start messaging</p></div></div>)}
        </div>
      </div>
    </div>
  );
};

export default InstallerMessagingModal;
