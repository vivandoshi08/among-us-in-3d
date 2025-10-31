import { useState, useEffect, useRef, useCallback } from 'react';
import { useRoom } from '../../network/session-provider';

interface Message {
    sender: string;
    senderName: string;
    message: string;
}

const MessagePanel = () => {
    const { room } = useRoom();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const messageInputRef = useRef<HTMLInputElement>(null);
    const messageContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            const container = messageContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    };

    const handleSend = useCallback(() => {
        const msg = inputMessage.trim();
        if (msg.length > 0 && room) {
            room.send("chat", { message: msg });
            setMessages((prevMessages) => [...prevMessages, { sender: 'You', senderName: 'You', message: msg }]);
            setInputMessage('');
        }
    }, [inputMessage, room]);

    const handleKeyPress = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    useEffect(() => {
        if (!room) return;

        const onChat = (data: Message) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        };

        room.onMessage('chat', onChat);

        return () => {
            (room as any).offMessage('chat', onChat);
        };
    }, [room]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const inputElement = messageInputRef.current;
        if (inputElement) {
            inputElement.addEventListener('keypress', handleKeyPress);
        }
        return () => {
            if (inputElement) {
                inputElement.removeEventListener('keypress', handleKeyPress);
            }
        };
    }, [handleKeyPress]);

    return (
        <div className="message-box" onClick={(e) => e.stopPropagation()}>
            <div className="message-list" ref={messageContainerRef}>
                {messages.map((msg, index) => (
                    <div key={index} className="message-item">
                        <strong style={{ color: msg.sender === 'system' ? 'red' : msg.sender === 'observer' ? 'yellow' : '#007bff', }}>
                            {msg.sender}:
                        </strong>{' '}
                        {msg.message}
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input
                    ref={messageInputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message..."
                    tabIndex={-1}
                />
                <button tabIndex={-1} onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default MessagePanel;
