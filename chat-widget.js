/**
 * Chat Widget - Connected to n8n Webhook
 * Floating chat bubble with modern UI
 */

class ChatWidget {
    constructor(config) {
        this.webhookUrl = config.webhookUrl;
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];

        this.init();
    }

    init() {
        this.createWidget();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    createWidget() {
        // Chat Toggle Button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'chat-toggle';
        toggleBtn.id = 'chatToggle';
        toggleBtn.setAttribute('aria-label', 'Open chat');
        toggleBtn.innerHTML = `
      <i class="fas fa-comments"></i>
      <span class="notification-badge" id="chatBadge" style="display: none;">1</span>
    `;

        // Chat Container
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.id = 'chatContainer';
        chatContainer.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="chat-header-info">
          <h4>Heri's AI Assistant</h4>
          <p><span class="chat-status-dot"></span>Online - Siap membantu</p>
        </div>
      </div>
      <div class="chat-messages" id="chatMessages">
        <!-- Messages will be inserted here -->
      </div>
      <div class="chat-input-area">
        <input 
          type="text" 
          class="chat-input" 
          id="chatInput" 
          placeholder="Ketik pesan Anda..."
          autocomplete="off"
        >
        <button class="chat-send-btn" id="chatSendBtn" aria-label="Send message">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    `;

        document.body.appendChild(toggleBtn);
        document.body.appendChild(chatContainer);

        // Store references
        this.toggleBtn = toggleBtn;
        this.container = chatContainer;
        this.messagesArea = document.getElementById('chatMessages');
        this.input = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('chatSendBtn');
        this.badge = document.getElementById('chatBadge');
    }

    bindEvents() {
        // Toggle chat
        this.toggleBtn.addEventListener('click', () => this.toggleChat());

        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Send message on Enter key
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.container.contains(e.target) &&
                !this.toggleBtn.contains(e.target)) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.container.classList.toggle('open', this.isOpen);
        this.toggleBtn.classList.toggle('active', this.isOpen);

        // Update icon
        const icon = this.toggleBtn.querySelector('i');
        icon.className = this.isOpen ? 'fas fa-times' : 'fas fa-comments';

        // Hide badge when opened
        if (this.isOpen) {
            this.badge.style.display = 'none';
        }

        // Focus input when opened
        if (this.isOpen) {
            setTimeout(() => this.input.focus(), 300);
        }
    }

    closeChat() {
        this.isOpen = false;
        this.container.classList.remove('open');
        this.toggleBtn.classList.remove('active');
        this.toggleBtn.querySelector('i').className = 'fas fa-comments';
    }

    addWelcomeMessage() {
        const welcomeMsg = `Halo! 👋 Saya adalah AI Assistant dari Heri Rahmansyah. 

Saya bisa membantu menjawab pertanyaan tentang:
• Portfolio dan proyek-proyek Heri
• Skill dan keahlian (AI, Data Analytics, Web Dev)
• Layanan yang ditawarkan
• Cara menghubungi Heri

Silakan tanya apa saja! 😊`;

        this.addMessage(welcomeMsg, 'bot');
    }

    addMessage(text, sender) {
        const time = new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatarIcon = sender === 'bot' ? 'fa-robot' : 'fa-user';

        messageDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas ${avatarIcon}"></i>
      </div>
      <div>
        <div class="message-content">${this.formatMessage(text)}</div>
        <div class="message-time">${time}</div>
      </div>
    `;

        this.messagesArea.appendChild(messageDiv);
        this.scrollToBottom();

        this.messages.push({ text, sender, time });
    }

    formatMessage(text) {
        // Convert line breaks to <br>
        return text.replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        if (this.isTyping) return;

        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;

        this.messagesArea.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typing = document.getElementById('typingIndicator');
        if (typing) {
            typing.remove();
        }
    }

    scrollToBottom() {
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    }

    async sendMessage() {
        const text = this.input.value.trim();
        if (!text || this.isTyping) return;

        // Add user message
        this.addMessage(text, 'user');
        this.input.value = '';

        // Disable input while processing
        this.input.disabled = true;
        this.sendBtn.disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.callWebhook(text);
            this.hideTypingIndicator();

            // Handle different response formats from n8n
            if (response && response.reply) {
                // Format from Portfolio Chatbot workflow: { reply: "..." }
                this.addMessage(response.reply, 'bot');
            } else if (response && response.response) {
                // Alternative format: { response: "..." }
                this.addMessage(response.response, 'bot');
            } else if (response && response.text) {
                // Another format: { text: "..." }
                this.addMessage(response.text, 'bot');
            } else if (response && typeof response === 'string') {
                this.addMessage(response, 'bot');
            } else {
                console.log('Unexpected response format:', response);
                this.addMessage('Maaf, saya tidak bisa memproses permintaan Anda saat ini. Silakan coba lagi.', 'bot');
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.addMessage('Maaf, terjadi kesalahan koneksi. Silakan coba lagi nanti atau hubungi langsung via WhatsApp.', 'bot');
        }

        // Re-enable input
        this.input.disabled = false;
        this.sendBtn.disabled = false;
        this.input.focus();
    }

    async callWebhook(message) {
        const response = await fetch(this.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // Method to show notification badge
    showNotification() {
        if (!this.isOpen) {
            this.badge.style.display = 'flex';
        }
    }
}

// Initialize chat widget when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    window.chatWidget = new ChatWidget({
        webhookUrl: 'https://n8n.bangheri.my.id/webhook/portfolio-chat'
    });
});
