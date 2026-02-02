'use client'

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Message } from '../types';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import {
  ArrowLeft,
  Ban,
  Check,
  CheckCheck,
  Flag,
  Menu,
  MoreVertical,
  Paperclip,
  Pin,
  Search,
  Send,
  Smile,
  Star,
  X,
} from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="relative w-11/12 max-w-6xl max-h-modal bg-surface rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex p-0 border-0">
        <div className="md:hidden absolute top-4 left-4 z-10">
          {!showMobileInbox && (
            <button onClick={() => setShowMobileInbox(true)} className="p-2 rounded-lg bg-surface">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
        </div>
        <DialogClose asChild>
          <button className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-surface" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        <div className={`${showMobileInbox ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 flex-col bg-surface border-r border-border`}>
          <div className="p-6 border-b border-border">
            <h2 className="text-heading-3 text-foreground mb-4">Messages</h2>
            <div className="relative mb-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-4 w-4" /><input type="text" placeholder="Search homeowners..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-body-small focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div className="flex space-x-1">{(['all', 'unread', 'archived'] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-caption rounded-md ${filter === f ? 'bg-primary text-foreground-secondary' : 'text-muted'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}</div>
          </div>
          <div className="flex-1 overflow-y-auto">{filteredConversations.map(c => (
            <div key={c.id} onClick={() => { setActiveConversation(c.id); setShowMobileInbox(false); }} className={`p-4 border-b border-border cursor-pointer ${activeConversation === c.id ? 'bg-surface border-r-2 border-r-primary' : ''}`}>
              <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0"><Image src={c.homeowner.avatar} alt={c.homeowner.name} width={40} height={40} className="rounded-full" />{c.homeowner.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-background rounded-full" />}</div>
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
                  <div className="relative"><Image src={activeConv.homeowner.avatar} alt={activeConv.homeowner.name} width={40} height={40} className="rounded-full" />{activeConv.homeowner.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-background rounded-full" />}</div>
                  <div><h3 className="text-foreground">{activeConv.homeowner.name}</h3><p className="text-body-small text-muted">{activeConv.homeowner.online ? 'Online' : `Last seen ${activeConv.homeowner.lastSeen ? formatTime(activeConv.homeowner.lastSeen) : 'awhile ago'}`}</p></div>
                </div>
                <div className="flex items-center space-x-2"><button className="p-2 rounded-lg text-muted"><Star className="h-4 w-4" fill={activeConv.starred ? 'currentColor' : 'none'} /></button><div className="relative"><button onClick={() => setDropdownOpen(dropdownOpen === activeConv.id ? null : activeConv.id)} className="p-2 rounded-lg text-muted"><MoreVertical className="h-4 w-4" /></button>{dropdownOpen === activeConv.id && <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg shadow-lg z-10"><button className="w-full px-4 py-2 text-left text-body-small text-foreground flex items-center space-x-2"><Pin className="h-4 w-4" /><span>Pin Conversation</span></button><button className="w-full px-4 py-2 text-left text-body-small text-foreground flex items-center space-x-2"><Ban className="h-4 w-4" /><span>Block Homeowner</span></button><button className="w-full px-4 py-2 text-left text-body-small text-error flex items-center space-x-2"><Flag className="h-4 w-4" /><span>Report</span></button></div>}</div></div>
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
                      {msg.senderId === 1 && <div className="text-muted">{msg.read ? <CheckCheck className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3" />}</div>}
                    </div>
                  </div>
                </div>
              ))}
              {activeConv.isTyping && <div className="flex justify-start"><div className="bg-surface px-4 py-3 rounded-2xl"><div className="flex space-x-1"><div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" /><div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} /><div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} /></div></div></div>}
            </div>
            <div className="p-4 bg-surface border-t border-border">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="Type your message..." rows={1} className="w-full px-4 py-3 pr-20 bg-surface rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary text-body-small" />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-1"><button className="p-1.5 rounded-lg text-muted"><Smile className="h-4 w-4" /></button><button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg text-muted"><Paperclip className="h-4 w-4" /></button></div>
                </div>
                <button onClick={handleSendMessage} disabled={!newMessage.trim()} className={`p-3 rounded-xl ${newMessage.trim() ? 'bg-primary text-foreground-secondary' : 'bg-subtle text-muted-foreground'}`}><Send className="h-4 w-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">{["Quote attached.","Does that time work?","Happy to help!","Let me know if you have questions."].map(reply => <button key={reply} onClick={() => setNewMessage(reply)} className="px-3 py-1.5 text-body-small bg-surface text-muted rounded-full">{reply}</button>)}</div>
              <input ref={fileInputRef} type="file" multiple className="hidden" />
            </div>
          </>
        ) : (<div className="flex-1 flex items-center justify-center bg-surface"><div className="text-center"><div className="w-16 h-16 bg-subtle rounded-full flex items-center justify-center mx-auto mb-4"><Menu className="h-5 w-5" /></div><h3 className="text-heading-4 text-foreground">Select a Conversation</h3><p className="text-muted">Choose a homeowner to start messaging</p></div></div>)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallerMessagingModal;
