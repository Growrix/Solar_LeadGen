'use client'

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Message, Conversation } from '../types';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import {
  ArrowLeft,
  Ban,
  Check,
  CheckCheck,
  Dot,
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

// --- Icon Components ---
const XIcon = ({ className = 'h-5 w-5' }: { className?: string }) => <X className={className} />;
const SearchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <Search className={className} />;
const StarIcon = ({ filled = false, className = 'h-4 w-4' }: { filled?: boolean; className?: string }) => (
  <Star className={className} fill={filled ? 'currentColor' : 'none'} />
);
const MoreVerticalIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <MoreVertical className={className} />;
const SendIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <Send className={className} />;
const SmileIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <Smile className={className} />;
const PaperclipIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <Paperclip className={className} />;
const CheckIcon = ({ className = 'h-3 w-3' }: { className?: string }) => <Check className={className} />;
const CheckCheckIcon = ({ className = 'h-3 w-3' }: { className?: string }) => <CheckCheck className={className} />;
const CircleIcon = ({ className = 'h-2 w-2' }: { className?: string }) => <Dot className={className} />;
const PinIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <Pin className={className} />;
const BlockIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <Ban className={className} />;
const FlagIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <Flag className={className} />;
const MenuIcon = ({ className = 'h-5 w-5' }: { className?: string }) => <Menu className={className} />;
const ArrowLeftIcon = ({ className = 'h-5 w-5' }: { className?: string }) => <ArrowLeft className={className} />;

interface InstantMessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstantMessagingModal: React.FC<InstantMessagingModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMobileInbox, setShowMobileInbox] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock conversations data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      installer: {
        id: 101,
        name: 'Solar Pro Australia',
        avatar: 'https://picsum.photos/seed/installer1/100/100',
        online: true
      },
      messages: [
        {
          id: 1,
          senderId: 101,
          content: 'Hi! Thanks for your solar quote request. I\'ve reviewed your property details and I\'m excited to help you go solar!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'text',
          read: true,
          sent: true
        },
        {
          id: 2,
          senderId: 1, // homeowner
          content: 'Great! Can you tell me more about the system size you\'d recommend?',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
          type: 'text',
          read: true,
          sent: true
        },
        {
          id: 3,
          senderId: 101,
          content: 'Based on your energy usage, I\'d recommend a 6.6kW system with 20 panels. This should cover about 80% of your electricity needs.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          type: 'text',
          read: false,
          sent: true
        }
      ],
      unreadCount: 1,
      pinned: true,
      starred: false,
      lastMessage: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isTyping: false
    },
    {
      id: 2,
      installer: {
        id: 102,
        name: 'Green Energy Solutions',
        avatar: 'https://picsum.photos/seed/installer2/100/100',
        online: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000)
      },
      messages: [
        {
          id: 4,
          senderId: 102,
          content: 'Hello! I saw your quote request. We specialize in premium solar installations. Would you like to schedule a consultation?',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          type: 'text',
          read: true,
          sent: true
        },
        {
          id: 5,
          senderId: 1,
          content: 'Yes, I\'d be interested. What times are available next week?',
          timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
          type: 'text',
          read: true,
          sent: true
        }
      ],
      unreadCount: 0,
      pinned: false,
      starred: true,
      lastMessage: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
      isTyping: false
    },
    {
      id: 3,
      installer: {
        id: 103,
        name: 'Bright Solar Co.',
        avatar: 'https://picsum.photos/seed/installer3/100/100',
        online: true
      },
      messages: [
        {
          id: 6,
          senderId: 103,
          content: 'Hi there! We offer competitive pricing on Tesla Powerwall batteries. Interested in adding storage to your solar system?',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          type: 'text',
          read: false,
          sent: true
        }
      ],
      unreadCount: 1,
      pinned: false,
      starred: false,
      lastMessage: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isTyping: true
    }
  ]);

  // Format timestamp
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Get active conversation
  const activeConv = conversations.find(c => c.id === activeConversation);

  // Filter conversations
  const filteredConversations = conversations
    .filter(conv => {
      if (filter === 'unread') return conv.unreadCount > 0;
      if (filter === 'archived') return false; // Mock: no archived conversations
      return true;
    })
    .filter(conv => 
      conv.installer.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.lastMessage.getTime() - a.lastMessage.getTime();
    });

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    const newMsg: Message = {
      id: Date.now(),
      senderId: 1, // homeowner
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
      read: false,
      sent: true
    };

    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, messages: [...conv.messages, newMsg], lastMessage: new Date() }
        : conv
    ));
    
    setNewMessage('');
    
    // Show notification if modal is not focused
    if (!document.hasFocus()) {
      showNewMessageNotification('New message sent');
    }
  };

  // Handle file upload
  const handleFileUpload = (files: FileList) => {
    if (!activeConversation || files.length === 0) return;

    Array.from(files).forEach(file => {
      const newMsg: Message = {
        id: Date.now() + Math.random(),
        senderId: 1,
        content: file.name,
        timestamp: new Date(),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        read: false,
        sent: true
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { ...conv, messages: [...conv.messages, newMsg], lastMessage: new Date() }
          : conv
      ));
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Show notification
  const showNewMessageNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [activeConv?.messages]);

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="relative w-11/12 max-w-6xl max-h-modal bg-surface rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex p-0 border-0">
        
        {/* Mobile Back Button */}
        <div className="md:hidden absolute top-4 left-4 z-10">
          {!showMobileInbox && (
            <button
              onClick={() => setShowMobileInbox(true)}
              className="p-2 rounded-lg bg-surface hover:bg-surface-hover transition-colors"
            >
              <ArrowLeftIcon />
            </button>
          )}
        </div>

        {/* Close Button */}
        <DialogClose asChild>
          <button
            className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-surface transition-colors"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </DialogClose>

        {/* Inbox Panel */}
        <div className={`${showMobileInbox ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 flex-col bg-surface border-r border-border`}>
          
          {/* Inbox Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading-3 text-foreground">Messages</h2>
              <span className="text-body-small text-muted">
                {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread
              </span>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search installers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-body-small focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {/* Filter Tabs */}
            <div className="flex space-x-1 mt-3">
              {(['all', 'unread', 'archived'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1.5 text-caption rounded-md transition-colors ${
                    filter === filterType
                      ? 'bg-primary text-foreground-secondary'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  setActiveConversation(conversation.id);
                  setShowMobileInbox(false);
                }}
                className={`p-4 border-b border-border cursor-pointer hover:bg-surface transition-colors ${
                  activeConversation === conversation.id ? 'bg-surface border-r-2 border-r-primary' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Image
                      src={conversation.installer.avatar}
                      alt={conversation.installer.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                    {conversation.installer.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-label text-foreground truncate">
                        {conversation.installer.name}
                        {conversation.pinned && (
                          <PinIcon className="inline ml-1 text-muted" />
                        )}
                        {conversation.starred && (
                          <StarIcon filled className="inline ml-1 text-warning" />
                        )}
                      </h4>
                      <span className="text-caption text-muted">
                        {formatTime(conversation.lastMessage)}
                      </span>
                    </div>
                    
                    <p className="text-body-small text-muted truncate mt-0.5">
                      {conversation.isTyping ? (
                        <span className="text-success italic">Typing...</span>
                      ) : (
                        conversation.messages[conversation.messages.length - 1]?.content || 'No messages'
                      )}
                    </p>
                    
                    {conversation.unreadCount > 0 && (
                      <div className="flex justify-end mt-1">
                        <span className="inline-flex items-center justify-center w-5 h-5 text-caption text-foreground-secondary bg-primary rounded-full">
                          {conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`${!showMobileInbox ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-surface">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={activeConv.installer.avatar}
                        alt={activeConv.installer.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                      {activeConv.installer.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-background rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-foreground">
                        {activeConv.installer.name}
                      </h3>
                      <p className="text-body-small text-muted">
                        {activeConv.installer.online ? (
                          'Online now'
                        ) : activeConv.installer.lastSeen ? (
                          `Last seen ${formatTime(activeConv.installer.lastSeen)}`
                        ) : (
                          'Offline'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setConversations(prev => prev.map(conv =>
                          conv.id === activeConv.id ? { ...conv, starred: !conv.starred } : conv
                        ));
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        activeConv.starred 
                          ? 'text-warning bg-warning/10' 
                          : 'text-muted hover:text-muted hover:bg-surface'
                      }`}
                    >
                      <StarIcon filled={activeConv.starred} />
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === activeConv.id ? null : activeConv.id)}
                        className="p-2 rounded-lg text-muted hover:text-muted hover:bg-surface transition-colors"
                      >
                        <MoreVerticalIcon />
                      </button>
                      
                      {dropdownOpen === activeConv.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border py-2 z-10">
                          <button
                            onClick={() => {
                              setConversations(prev => prev.map(conv =>
                                conv.id === activeConv.id ? { ...conv, pinned: !conv.pinned } : conv
                              ));
                              setDropdownOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-body-small text-foreground hover:bg-surface flex items-center space-x-2"
                          >
                            <PinIcon />
                            <span>{activeConv.pinned ? 'Unpin' : 'Pin'} Conversation</span>
                          </button>
                          <button className="w-full px-4 py-2 text-left text-body-small text-foreground hover:bg-surface flex items-center space-x-2">
                            <BlockIcon />
                            <span>Block Installer</span>
                          </button>
                          <button className="w-full px-4 py-2 text-left text-body-small text-error hover:bg-error/10 flex items-center space-x-2">
                            <FlagIcon />
                            <span>Report</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={chatAreaRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface custom-scrollbar"
              >
                {activeConv.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 1 ? 'justify-end' : 'justify-start'} message-enter`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.senderId === 1 ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          message.senderId === 1
                            ? 'bg-primary text-foreground-secondary rounded-br-md'
                            : 'bg-surface text-foreground rounded-bl-md border border-border'
                        }`}
                      >
                        {message.type === 'text' && (
                          <p className="text-body-small">{message.content}</p>
                        )}
                        
                        {message.type === 'image' && (
                          <div>
                            <Image 
                              src={message.fileUrl || '/placeholder.jpg'} 
                              alt={message.fileName || 'Image'}
                              width={300}
                              height={200}
                              className="max-w-full h-auto rounded-lg mb-2"
                            />
                            <p className="text-caption opacity-75">{message.fileName}</p>
                          </div>
                        )}
                        
                        {message.type === 'file' && (
                          <div className="flex items-center space-x-2">
                            <PaperclipIcon className="h-4 w-4 opacity-75" />
                            <div>
                              <p className="text-body-small">{message.fileName}</p>
                              <p className="text-caption opacity-75">Click to download</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center mt-1 space-x-1 ${message.senderId === 1 ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-caption text-muted">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.senderId === 1 && (
                          <div className="text-muted">
                            {message.read ? (
                              <CheckCheckIcon className="text-primary" />
                            ) : message.sent ? (
                              <CheckIcon />
                            ) : (
                              <CircleIcon />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeConv.isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-surface px-4 py-3 rounded-2xl rounded-bl-md border border-border">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div 
                className="p-4 bg-surface border-t border-border"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Drag overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <PaperclipIcon className="mx-auto mb-2 h-8 w-8 text-primary" />
                      <p className="text-primary">Drop files to send</p>
                    </div>
                  </div>
                )}

                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      rows={1}
                      className="w-full px-4 py-3 pr-20 bg-surface border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary text-body-small max-h-32"
                      style={{ minHeight: '44px' }}
                    />
                    
                    <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-1.5 rounded-lg text-muted hover:text-muted hover:bg-surface-hover transition-colors"
                      >
                        <SmileIcon />
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg text-muted hover:text-muted hover:bg-surface-hover transition-colors"
                      >
                        <PaperclipIcon />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-3 rounded-xl transition-colors ${
                      newMessage.trim()
                        ? 'bg-primary text-foreground-secondary hover:bg-primary/90 shadow-sm'
                        : 'bg-subtle text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <SendIcon />
                  </button>
                </div>
                
                {/* Quick Replies */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Thanks!', 'Can we schedule a call?', 'Send me more details', 'What about pricing?'].map((reply) => (
                    <button
                      key={reply}
                      onClick={() => setNewMessage(reply)}
                      className="px-3 py-1.5 text-body-small bg-surface text-muted rounded-full hover:bg-surface-hover transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center bg-surface">
              <div className="text-center">
                <div className="w-16 h-16 bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                  <MenuIcon />
                </div>
                <h3 className="text-heading-4 text-foreground mb-2">
                  Select a Conversation
                </h3>
                <p className="text-muted">
                  Choose an installer from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-60 animate-slide-up">
          <div className="bg-primary text-foreground-secondary px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-surface rounded-full animate-pulse"></div>
            <span className="text-body-small">{notificationMessage}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default InstantMessagingModal;
