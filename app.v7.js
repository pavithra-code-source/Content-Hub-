document.addEventListener('DOMContentLoaded', () => {
    // AI Voice Synthesis Helper
    function speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any previous speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }

    // ---- 1. Translation Tool Logic ----
    const translateToggle = document.getElementById('translateToggle');
    const originalTexts = document.querySelectorAll('.msg-text.original');
    const translatedTexts = document.querySelectorAll('.msg-text.translated');
    let isTranslated = true; // Auto-translate is on by default

    translateToggle.addEventListener('click', () => {
        isTranslated = !isTranslated;
        
        // Toggle Active state on button
        if(isTranslated) {
            translateToggle.classList.add('active');
            translateToggle.innerHTML = '<i data-feather="repeat"></i> Enhance Message';
        } else {
            translateToggle.classList.remove('active');
            translateToggle.innerHTML = '<i data-feather="repeat"></i> View Original';
        }
        feather.replace(); // re-initialize icons in the button

        // Toggle visibility of texts
        originalTexts.forEach(el => el.style.display = isTranslated ? 'none' : 'block');
        translatedTexts.forEach(el => el.style.display = isTranslated ? 'block' : 'none');
    });

    // Global Translation Toggle in Header
    const globalTranslateBtn = document.getElementById('globalTranslateBtn');
    const currentLang = document.getElementById('currentLang');
    let isGlobalEng = true;
    
    globalTranslateBtn.addEventListener('click', () => {
        isGlobalEng = !isGlobalEng;
        currentLang.innerText = isGlobalEng ? 'EN' : 'HI';
        if(!isGlobalEng) {
            globalTranslateBtn.style.color = '#7c3aed';
        } else {
            globalTranslateBtn.style.color = '';
        }
    });

    // ---- 2. UPI Modal Logic ----
    const upiRequestBtn = document.getElementById('upiRequestBtn');
    const generateUpiShortcutBtn = document.getElementById('generateUpiShortcutBtn');
    const upiModal = document.getElementById('upiModal');
    const closeUpiModal = document.getElementById('closeUpiModal');
    const cancelUpiBtn = document.getElementById('cancelUpiBtn');
    const sendUpiBtn = document.getElementById('sendUpiBtn');
    const upiAmount = document.getElementById('upiAmount');
    const chatArea = document.getElementById('chatArea');

    function openModal() { upiModal.classList.add('active'); }
    function closeModal() { upiModal.classList.remove('active'); }

    upiRequestBtn.addEventListener('click', openModal);
    generateUpiShortcutBtn.addEventListener('click', openModal);
    closeUpiModal.addEventListener('click', closeModal);
    cancelUpiBtn.addEventListener('click', closeModal);

    // Send UPI Link to Chat
    sendUpiBtn.addEventListener('click', () => {
        const amount = upiAmount.value || 0;
        
        // Mock sending message
        const upiLink = `upi://pay?pa=merchant@upi&pn=NiraAI&am=${amount}&cu=INR`;
        const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(upiLink)}&size=150&margin=1`;

        const messageHtml = `
            <div class="message outgoing" style="animation: modalIn 0.3s ease;">
                <div class="msg-bubble" style="background: var(--panel-bg); color: var(--text-primary); border: 1px solid rgba(16,185,129,0.3); border-right: 4px solid var(--success);">
                    <div style="font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <i data-feather="check-circle" style="color: var(--success); width: 16px;"></i> Payment Link Sent
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">Requested: ₹${amount} for Service</div>
                    
                    <!-- Integrated UPI QR Code -->
                    <div style="background: white; padding: 10px; border-radius: 8px; margin-bottom: 12px; text-align: center;">
                        <img src="${qrUrl}" alt="UPI QR Code" style="width: 150px; height: 150px; border-radius: 4px;">
                        <p style="color: #333; font-size: 11px; margin-top: 5px; font-weight: 600;">Scan to Pay via Any UPI App</p>
                    </div>

                    <button class="btn btn-outline" style="width: 100%; border-color: rgba(16,185,129,0.5); color: var(--success);" disabled>
                         Pending Customer Payment
                    </button>
                </div>
                <span class="msg-time">Just now</span>
            </div>
        `;
        
        chatArea.insertAdjacentHTML('beforeend', messageHtml);
        feather.replace(); // Refresh icons
        chatArea.scrollTop = chatArea.scrollHeight; // Auto-scroll
        closeModal();
        
        // Speak confirmation
        speakText("UPI Payment Request for " + amount + " rupees has been successfully sent to the customer.");
    });

    // ---- 3. Voice Recording Mockup ----
    const voiceMicBtn = document.getElementById('voiceMicBtn');
    const voiceOverlay = document.getElementById('voiceOverlay');
    const recordingTimer = document.getElementById('recordingTimer');
    const transcriptionTextElement = document.querySelector('.voice-indicator p.text-sm');
    let isRecording = false;
    let timerInterval;
    let seconds = 0;

    voiceMicBtn.addEventListener('click', () => {
        if(!isRecording) {
            // Start recording
            isRecording = true;
            voiceOverlay.classList.add('active');
            voiceMicBtn.style.color = '#ef4444'; // turn mic red
            transcriptionTextElement.innerText = "Simulating voice recording...";
            
            seconds = 0;
            recordingTimer.innerText = '0:00';
            timerInterval = setInterval(() => {
                seconds++;
                recordingTimer.innerText = `0:0${seconds}`;
                // Auto stop after 3 seconds for demo
                if(seconds >= 3) {
                    stopRecordingAndTranscribe();
                }
            }, 1000);
        } else {
            stopRecordingAndTranscribe();
        }
    });

    function stopRecordingAndTranscribe() {
        clearInterval(timerInterval);
        isRecording = false;
        voiceOverlay.classList.remove('active');
        voiceMicBtn.style.color = '';
        transcriptionTextElement.innerText = "Speak your message aloud...";
        
        // Mock Transcription Injection
        const msgHtml = `
            <div class="message outgoing" style="animation: modalIn 0.3s ease;">
                <div class="msg-bubble" style="background: var(--accent-primary);">
                    <div class="audio-player" style="margin-bottom: 10px;">
                        <button class="play-btn" style="background: rgba(0,0,0,0.2);"><i data-feather="play"></i></button>
                        <div class="waveform" style="background: rgba(255,255,255,0.4);"><div style="width: 100%; height: 100%; background: white;"></div></div>
                        <span class="duration" style="color: white;">0:03</span>
                    </div>
                    <div class="ai-transcription" style="border-top-color: rgba(0,0,0,0.1); color: white;">
                        <i data-feather="file-text" style="color: #c4b5fd;"></i> 
                        <span class="transcription-text">"Hi Rahul, I have generated and sent the payment link for you. Have a great day!"</span>
                    </div>
                </div>
                <span class="msg-time">Just now</span>
            </div>
        `;
        chatArea.insertAdjacentHTML('beforeend', msgHtml);
        feather.replace();
        chatArea.scrollTop = chatArea.scrollHeight;
        
        // Speak the transcription
        speakText("Voice note successfully transcribed: Hi Rahul, I have generated and sent the payment link for you. Have a great day!");
    }

    // ---- 4. Text Message Mockup & TTS ----
    const sendBtn = document.querySelector('.send-btn');
    const msgInput = document.querySelector('.input-wrapper input');

    sendBtn.addEventListener('click', () => {
        const text = msgInput.value.trim();
        if(text) {
            const msgHtml = `
                <div class="message outgoing" style="animation: modalIn 0.3s ease;">
                    <div class="msg-bubble">${text}</div>
                    <span class="msg-time">Just now</span>
                </div>
            `;
            chatArea.insertAdjacentHTML('beforeend', msgHtml);
            msgInput.value = '';
            chatArea.scrollTop = chatArea.scrollHeight;
            
            // Mock AI reply after 1 second
            setTimeout(() => {
                const aiReplyText = "Got it. Is there anything else you'd like to add?";
                const replyHtml = `
                    <div class="message system-ai" style="animation: modalIn 0.3s ease;">
                        <div class="msg-bubble ai-suggestion">
                            <span class="ai-label"><i data-feather="cpu"></i> AI Assisting</span>
                            <div class="msg-text">${aiReplyText}</div>
                        </div>
                    </div>
                `;
                chatArea.insertAdjacentHTML('beforeend', replyHtml);
                feather.replace();
                chatArea.scrollTop = chatArea.scrollHeight;
                
                // Trigger AI Voice Reading Out the Text!
                speakText(aiReplyText);
                
            }, 1000);
        }
    });
    
    // Also send on Enter key
    msgInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') sendBtn.click();
    });

    // ---- 5. Global Toast Notification System & Mock Interactive Buttons ----
    function showToast(message, iconName = 'info') {
        const container = document.getElementById('toastContainer');
        if(!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast-icon"><i data-feather="${iconName}"></i></span> <span style="font-weight: 500;">${message}</span>`;
        container.appendChild(toast);
        feather.replace();
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // A. Wire Sidebar Links
    const sidebarLinks = document.querySelectorAll('.nav-links li');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if(link.classList.contains('active')) return;
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const sectionName = link.innerText.trim();
            showToast(`Loading Application View: ${sectionName}...`, 'layout');
        });
    });

    const sidebarBottomLinks = document.querySelectorAll('.sidebar-bottom li');
    sidebarBottomLinks.forEach(link => {
        link.addEventListener('click', () => {
            showToast(`Opening ${link.innerText.trim()}...`, 'settings');
        });
    });

    // B. Wire Header Actions
    const bellBtn = document.querySelector('.header-actions .icon-btn');
    if(bellBtn) {
        bellBtn.addEventListener('click', () => {
            showToast('You have 0 new notifications.', 'bell-off');
        });
    }

    // C. Wire Filter Tabs
    const filterTabs = document.querySelectorAll('.filter-tabs .tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showToast(`Filtering chats by: ${tab.innerText.trim()}`, 'filter');
        });
    });

    // D. Wire Chat Items selection
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        item.addEventListener('click', () => {
            chatItems.forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            item.classList.remove('unread'); // mark as read
            const name = item.querySelector('h3').innerText.split('\\n')[0]; // grab name without tags
            showToast(`Loaded conversation with ${name}`, 'message-square');
        });
    });

    // E. Wire Chat Tools (Call, etc.)
    const chatTools = document.querySelectorAll('.chat-tools .tool-btn');
    chatTools.forEach(tool => {
        if(tool.id === 'translateToggle') return; // handled previously
        tool.addEventListener('click', () => {
            const action = tool.innerText.trim() || 'Menu options';
            showToast(`Feature restricted: ${action} not available in prototype.`, 'lock');
        });
    });

    // F. Wire AI Proposed Action Buttons & Audio play via Event Delegation
    chatArea.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if(!btn) return;
        
        if(btn.classList.contains('play-btn') && !btn.closest('.audio-player').querySelector('.duration').innerText.includes('0:03')) {
            showToast("Playing voice memo...", "play-circle");
        } else if(btn.innerText.trim() === 'Send' && btn.closest('.ai-suggestion')) {
            showToast("AI response successfully fired to WhatsApp user!", "send");
            btn.innerHTML = 'Sent';
            btn.disabled = true;
        } else if(btn.innerText.trim() === 'Edit' && btn.closest('.ai-suggestion')) {
            showToast("Opening edit mode for AI draft...", "edit-2");
        }
    });

    // G. Wire Lead Profile Sidebar actions
    const bookSlotBtn = document.querySelector('.lead-profile .action-btn:not(.special)');
    if(bookSlotBtn) {
        bookSlotBtn.addEventListener('click', () => {
            showToast("Slot instantly booked! Confirmation sent to user.", "calendar");
            bookSlotBtn.innerHTML = '<i data-feather="check"></i> Booked (4 PM)';
            bookSlotBtn.style.background = 'rgba(16,185,129,0.2)';
            bookSlotBtn.style.color = '#10b981';
            feather.replace();
        });
    }

    // H. Attach paperclip button
    const attachBtn = document.querySelector('.attach-btn:not(#upiRequestBtn)');
    if(attachBtn) {
        attachBtn.addEventListener('click', () => {
            showToast("Opening advanced file upload dialog...", "paperclip");
        });
    }

});
