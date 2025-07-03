import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import Button from './Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './Dialog';
import { ChatbotService } from '@/services/chatbot';

interface ChatbotProps {
  className?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: number; text: string; isUser: boolean }>>([]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true
    };

    setMessages(prev => [...prev, newMessage]);
    const messageText = inputValue;
    setInputValue('');

    try {
      // Send message to backend chatbot endpoint
      const response = await ChatbotService.sendMessage(messageText);
      
      const botResponse = {
        id: Date.now() + 1,
        text: response.response,
        isUser: false
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      // Handle error with fallback message
      const errorResponse = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false
      };
      setMessages(prev => [...prev, errorResponse]);
      console.error('Chatbot error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <div className={cn("fixed bottom-6 right-6 z-40", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </Button>
      </div>

      {/* Chatbot Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen} size="xl">
        <DialogContent className="h-96 flex flex-col">
          <DialogHeader>
            <DialogTitle>Chat Assistant</DialogTitle>
            <DialogDescription>
              Ask me anything! I'm here to help.
            </DialogDescription>
          </DialogHeader>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-3 py-2 rounded-lg text-sm",
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              disabled={!inputValue.trim()}
            >
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Chatbot;