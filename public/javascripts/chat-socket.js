
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function createSenderMessageItem(messval) {
    let messageItem = document.createElement('div');
    messageItem.style = 'text-align: right;';
    messageItem.className = 'message-item mess-send';

    let messageItemContent = document.createElement('div');
    messageItemContent.className = 'mess-item-content';
    messageItemContent.style = 'display: inline-block;background: #4080ff;color: #ffffff;padding: 5px 10px;margin-bottom: 5px;border-top-left-radius: 15px;border-bottom-left-radius: 15px; border-top-right-radius: 15px;';
    messageItemContent.textContent = messval;

    messageItem.appendChild(messageItemContent);

    return messageItem;
}

function createInboxMessageItem(data) {
    let messageItem = document.createElement('div');
    messageItem.style = 'text-align: left;';
    messageItem.className = 'message-item mess-ib';

    let avatar = document.createElement('span');
    if (data.sender && data.sender.avatar) {
        avatar.className = 'mess-item-avatar';
        avatar.style = 'width: 30px;height:30px;margin-right: 8px;display:inline-block;background:url(' + data.sender.avatarUrl + ') no-repeat center center /cover';
    } else {
        avatar.className = 'mess-item-avatar';
        avatar.style = 'width: 30px;height:30px;margin-right: 8px;display:inline-table;text-align:center;vertical-align:middle;border-radius:50%;background:#ffffff';
        let icon = document.createElement('i');
        icon.className = 'fa fa-user-o';
        icon.style = 'display:table-cell;vertical-align:middle;font-size: 20px;';
        avatar.appendChild(icon);
    }

    let messageItemContent = document.createElement('div');
    messageItemContent.className = 'mess-item-content';
    messageItemContent.style = 'max-width: calc(100% - 38px); overflow: hidden; text-overflow: ellipsis;vertical-align: top;display: inline-block;background: #ffffff;color: #333333;padding: 5px 10px;margin-bottom: 5px;border-bottom-left-radius: 15px; border-top-right-radius: 15px; border-bottom-right-radius: 15px;';
    messageItemContent.textContent = data.messageContent;

    messageItem.appendChild(avatar);
    messageItem.appendChild(messageItemContent);

    return messageItem;
}

function createNewChatBox(user, isGroup = false) {
    console.log('user', user);
    /**
     * Check exist chatbox
     */
    let chatBoxItem = document.getElementById('chat-box-item-' + (user.id || user._id || user.room));
    if (chatBoxItem)
        return;
    /**
     * Declare variables
     */
    const boxWidth = 280,
        boxHeight = 350,
        boxHeaderHeight = 72,
        boxFooterHeight = 68,
        boxContentHeight = 210;

    let chatBox = document.createElement('div');
    chatBox.className = 'chat-box';
    chatBox.id = 'chat-box-item-' + (user.id || user._id || user.room);
    chatBox.style = 'width: ' + boxWidth + 'px; height: ' + boxHeight
                    + 'px; position: relative; z-index: 9999; float: right; margin-right: 15px; '
                    + 'background: #ccc; box-shadow:-1px -1px 5px rgba(50, 50, 50, 0.17); border-top-left-radius: 5px;'
                    + 'border-top-right-radius: 5px;';

    /**
     * create chat box header
     */
    let chatBoxHeader = document.createElement('div');
    chatBoxHeader.className = 'chat-box-header';
    chatBoxHeader.style = 'background-color: #fff; color: #fff; height: '
                        + boxHeaderHeight + 'px; border-top-left-radius: 5px; border-top-right-radius: 5px;';
    chatBox.appendChild(chatBoxHeader);
    
    let topHeader = document.createElement('div');
    topHeader.className = 'top-header';
    topHeader.style = 'cursor: pointer;background-color: #0ba14b; border-color: #0ba14b; color: #fff; height: 28px; border-top-left-radius: 5px; border-top-right-radius: 5px;text-align: center;';
    topHeader.onclick = function() {
        chatBox.classList.toggle('box-hidden');
        if (chatBox.classList.contains('box-hidden')) {
            chatBox.style.bottom = '-322px';
        } else {
            chatBox.style.bottom = '0px';
        }
    }
    chatBoxHeader.appendChild(topHeader);

    let boxHeaderInfo = document.createElement('div');
    boxHeaderInfo.className = 'box-header-info';
    boxHeaderInfo.style = 'display: inline-block;padding-left: 15px;';
    topHeader.appendChild(boxHeaderInfo);

    let boxTitle = document.createElement('div');
    boxTitle.className = 'box-title';
    boxTitle.style = 'height: 28px; line-height: 28px; font-size: 12px; text-transform: uppercase;'; 
    boxTitle.textContent = user.isGroup ? (user.groupName || user.userName) : (user.groupName || (user.firstName + ' ' + user.lastName));
    boxHeaderInfo.appendChild(boxTitle);

    let headerToolbar = document.createElement('div');
    headerToolbar.className = 'box-header-toolbar';
    headerToolbar.style = 'display: inline-block; cursor: pointer; position: absolute; right: 15px;';
    topHeader.appendChild(headerToolbar);

    let hideBox = document.createElement('span');
    hideBox.className = 'hide-box';
    hideBox.style = 'width: 12px; height: 10px; margin-top: 9px; margin-right: 8px; display: inline-block;'
                + ' background: url(/images/chat-icons-v1.png); background-position: 0 -3px; vertical-align: top;';
    headerToolbar.appendChild(hideBox);

    let closeBox = document.createElement('span');
    closeBox.className = 'close-box';
    closeBox.style = 'width: 12px; height: 12px; margin-top: 8px; display: inline-block;'
                    + ' background: url(/images/chat-icons-v1.png); background-position: -26px -2px;';
    closeBox.onclick = function() {
        chatBox.remove();
    }
    headerToolbar.appendChild(closeBox);

    /**
     * Header avata
     */
    let avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.style = 'position: absolute;display: table;text-align: center;vertical-align: middle;z-index: 200;width: 54px;height: 54px;float: left;left: 15px;top: 15px;background: #ccc;border-radius:3px;border: 1px solid #eee;';
    
    if (user.avatar) {
        let avtImg = document.createElement('img');
        avtImg.className='img img-responsive img-circle';
        avtImg.src = user.avatarUrl;
        avtImg.style = 'width: 54px;height: 54px;';
        avatar.appendChild(avtImg);
    } else {
        let iconAvtDefault = document.createElement('i');
        iconAvtDefault.className = 'fa fa-user-o';
        iconAvtDefault.style = 'display: table-cell;vertical-align: middle;font-size: 30px;';
        avatar.appendChild(iconAvtDefault);
    }
    
    chatBoxHeader.appendChild(avatar);

    /**
     * Header account
     */
    let account = document.createElement('div');
    account.className = 'account';
    account.style = 'position: relative;height: 44px;padding-left: 85px;padding-top: 3px;background: #fff;z-index: 1;border-bottom: 1px solid #eee;'
    chatBoxHeader.appendChild(account);

    if (user.email) {
        let accountName = document.createElement('div');
        accountName.className = 'account-name';
        accountName.style = 'height: 16px;line-height: 16px;color:#1874ba;font-weight:bold;';
        accountName.textContent = user.email;
        account.appendChild(accountName);
    }

    if (user.phoneNumber) {
        let hotline = document.createElement('div');
        hotline.className = 'hotline';
        hotline.textContent = 'SĐT: ' + (user.phoneNumber); 
        hotline.style = 'color: #aaaaaa';
        account.appendChild(hotline);
    }

    let settingEl = document.createElement('span');
    settingEl.className = 'setting';
    settingEl.style = 'position: absolute;float:right;right:10px;top: 13px;width: 16px;height:16px;background:url(/images/chat-icons-v1.png);background-position: -108px 0px';
    account.appendChild(settingEl);

    /**
     * Create chat box content
     */
    let chatBoxContent = document.createElement('div');
    chatBoxContent.className = 'chat-box-content';
    chatBoxContent.style = 'height: ' + boxContentHeight + 'px; background: #e5e5e5; overflow-y: auto;padding: 15px;';
    chatBox.appendChild(chatBoxContent);

    /* === Request server get list message ===*/
    let getMessageUrl = '/api/chat/messages/' + (user.id || user._id || user.room) + '?isGroup=' + isGroup;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(xhttp.readyState == 4 && xhttp.status == 200) {
            let dataRes = JSON.parse(this.response);
            let data = dataRes.data;

            if (data && data instanceof Array) {
                for (let i=0; i<data.length; i++) {
                    if (data[i].sender.id === socket.identification.room) {
                        let senderMess = createSenderMessageItem(data[i].messageContent);
                        chatBoxContent.appendChild(senderMess);
                    } else {
                        let inboxItem = createInboxMessageItem(data[i]);
                        chatBoxContent.appendChild(inboxItem);
                    }
                }
                chatBoxContent.scrollTop = chatBoxContent.scrollHeight;
            }
        }
    };
    xhttp.open('GET', getMessageUrl, true);
    xhttp.send();

    /**
     * Create chat box footer
     */
    let chatBoxFooter = document.createElement('div');
    chatBoxFooter.className = 'chat-box-footer';
    chatBoxFooter.style = 'padding: 5px 0 5px 5px;';
    chatBox.appendChild(chatBoxFooter);

    let mainFooterContainer = document.createElement('div');
    mainFooterContainer.className = 'main-footer-container';
    mainFooterContainer.style = 'height: ' + boxFooterHeight/2 + 'px';
    chatBoxFooter.appendChild(mainFooterContainer);

    let inputMessage = document.createElement('textarea');
    inputMessage.className = 'message-input';
    inputMessage.placeholder = 'Nhập tin nhắn ...';
    inputMessage.style = 'padding: 0 10px; width: ' + (boxWidth - 48) + 'px;height: ' + boxFooterHeight/2 + 'px; line-height: ' + boxFooterHeight/2 + 'px; resize: none;border:none;'
                        + '; box-sizing: border-box;border-radius: 3px;';
    inputMessage.onkeydown = function(e) {
        var code = e.keyCode ? e.keyCode : e.which;
        if (code == 13 && !e.shiftKey) {  // Enter keycode
            let messVal = inputMessage.value;

            if (messVal) {
                // let messageItem = createSenderMessageItem(messVal);
                // chatBoxContent.appendChild(messageItem);
                /**
                 * Emit message to socket server
                 */
                let dataSend = {
                    sender: socket.identification,
                    to: {
                        _id: user.room || user.id || user._id,
                        room: user.room || user.id || user._id,
                        userName: isGroup ? user.groupName : user.userName,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phoneNumber: user.phoneNumber,
                        groupName: user.groupName,
                        isGroup: isGroup
                    },
                    messageContent: messVal
                }

                socket.emit('send_message', dataSend);
            }
            inputMessage.value = '';
            chatBoxContent.scrollTop = chatBoxContent.scrollHeight;
            return false;
        }
    }
    mainFooterContainer.appendChild(inputMessage);
    inputMessage.select();

    let btnSend = document.createElement('button');
    btnSend.className = 'send-message';
    btnSend.style = 'width: 40px; height: 25px; border: none; margin-top: 5px; background: url(/images/chat-icons-v1.png); background-position: -70px 0px;box-sizing: border-box; vertical-align: top;';
    btnSend.onclick = function() {
        let messVal = inputMessage.value;

        if (messVal) {
            // let messageItem = createSenderMessageItem(messVal);
            // chatBoxContent.appendChild(messageItem);
            /**
             * Emit message to socket server
             */
            let dataSend = {
                sender: socket.identification,
                to: {
                    _id: user.room || user.id || user._id,
                    room: user.room || user.id || user._id,
                    userName: isGroup ? user.groupName : user.userName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    groupName: user.groupName,
                    isGroup: isGroup
                },
                messageContent: messVal
            }
            console.log('dataSendttt', dataSend);
            socket.emit('send_message', dataSend);
        }
        inputMessage.value = '';
        chatBoxContent.scrollTop = chatBoxContent.scrollHeight;
    }
    mainFooterContainer.appendChild(btnSend);

    let footerTools = document.createElement('div');
    footerTools.style = 'position:absolute;bottom: 5px;width: 100%;display: none;';
    footerTools.className = 'footer-tools';
    chatBoxFooter.appendChild(footerTools);

    let footerToolItem = document.createElement('span');
    footerToolItem.className = 'footer-tool-item';
    footerToolItem.style = 'cursor: pointer;margin-right: 5px;';
    footerTools.appendChild(footerToolItem);

    let toolItemIcon = document.createElement('i');
    toolItemIcon.className = 'fa fa-image';
    toolItemIcon.style = 'font-size: 18px;';
    footerToolItem.appendChild(toolItemIcon);

    let footerToolItemHeart = document.createElement('span');
    footerToolItemHeart.className = 'footer-tool-item';
    footerToolItemHeart.style = 'cursor: pointer;margin-right: 15px;float: right; right: 0; color: #ffffff';
    footerTools.appendChild(footerToolItemHeart);

    let toolItemIconHeart = document.createElement('i');
    toolItemIconHeart.className = 'fa fa-heart';
    toolItemIconHeart.style = 'font-size: 18px;';
    footerToolItemHeart.appendChild(toolItemIconHeart);

    // document.body.appendChild(chatBox);
    /**
     * Append chatbox to container
     */
    let chatWrap = document.getElementById('chat-wrap');
    if (!chatWrap) {
        chatWrap = document.createElement('div');
        chatWrap.id = 'chat-wrap';
        chatWrap.style = 'position: fixed;bottom: 0;float:right;right:0;padding-right: 15px;';
        document.body.appendChild(chatWrap);
    }
    chatWrap.appendChild(chatBox);
}

/*
* Connect socket
*/
const token = getCookie('ams_token');
const socket = io('http://backend.thinhnv.net');

socket.on('connect', () => {
    socket.on('join_chat_successfully', (data) => {
        socket.identification = data;
    });

    /**
     * Event receive message from server
     */
    socket.on('message', (data) => {
        let messageSound = new Audio('/sounds/message.mp3');
        messageSound.play();
       
        /**
         * reload contact
         */
        getChatContacts();

        
        if (data.sender.id === socket.identification.id) {
            return;
        }

        let chatBoxItem = document.getElementById('chat-box-item-' + (data.sender.id || data.sender._id || data.sender.room));
       
        if (data.to.isGroup) {
            chatBoxItem = document.getElementById('chat-box-item-' + (data.to._id || data.to._id || data.to.room));
        }
        console.log("chatboxItem", chatBoxItem);
        if (!chatBoxItem) {
            if (data.to.isGroup){
                createNewChatBox(data.to, true);
            } else {
                createNewChatBox(data.sender)
            }
        } else {
            let chatBoxContent = document.querySelector('#chat-box-item-' + (data.sender.id || data.sender._id || data.sender.room) + ' .chat-box-content');

            if (data.to.isGroup) {
                chatBoxContent = document.querySelector('#chat-box-item-' + (data.to.id || data.to._id || data.to.room) + ' .chat-box-content');
            }

            if (chatBoxContent) {
                let messEl = createInboxMessageItem(data);
                chatBoxContent.appendChild(messEl);
                chatBoxContent.scrollTop = chatBoxContent.scrollHeight;
            }
        }
    })

    /**
     * Event owner message 
     */
    socket.on('owner_message', (data) => {
        console.log('owner_mess', data);
        let chatBoxItem = document.getElementById('chat-box-item-' + (data.to.id || data.to._id || data.to.room));
       
        if (!chatBoxItem) {
            createNewChatBox(data.to);
        } else {
            let chatBoxContent = document.querySelector('#chat-box-item-' + (data.to.id || data.to._id || data.to.room) + ' .chat-box-content');
            if (chatBoxContent) {
                let messEl = createSenderMessageItem(data.messageContent);
                chatBoxContent.appendChild(messEl);
                chatBoxContent.scrollTop = chatBoxContent.scrollHeight;
            }
        }
    });

    /**
     * Event new service request
     */
    socket.on('noti_new_service_request', (noti) => {
        let messageSound = new Audio('/sounds/notification.mp3');
        messageSound.play();
        /**
         * Get list notification
         */
        let url = '/api/notification/list-by-role';
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if(xhttp.readyState == 4 && xhttp.status == 200) {
            let dataRes = JSON.parse(this.response);
            if (dataRes.success) {
                let data = dataRes.data;
                let countNotiUnread = document.getElementById('n-unread-noti');

                if (data && data.length > 0) {
                    let count = 0;
                    countNotiUnread.style = 'display: block';

                    let notificationList = document.getElementById('header-notification-list');
                    notificationList.innerHTML = '';
                    for (let i=0; i<data.length; i++) {
                        let notiItem = document.createElement('li');
                        if (data[i].status === 1) {
                            notiItem.style = 'background: #ffffff;border-bottom: 1px solid #ccc;';
                        } else {
                            count ++;
                            notiItem.style = 'background: #edf2fa;border-bottom: 1px solid #ccc;';
                        }
                        let link = document.createElement('a');
                        // link.textContent = data[i].title;
                        link.href = '/notification/view/' + data[i]._id;
                        link.innerHTML = '<span>' + data[i].title + '</span>';

                        if (data[i].objId && data[i].objId.service ) {
                        link.innerHTML += '<br/><b><i>' + data[i].objId.service.serviceName + '</i></b>';
                        }

                        notiItem.appendChild(link);
                        notificationList.appendChild(notiItem);
                    }
                    if (count > 0)
                        countNotiUnread.textContent = count;
                    else
                        countNotiUnread.style = 'display: none';
                } else {
                    countNotiUnread.style = 'display: none';
                }
            }
            }
        };
        xhttp.open('GET', url, true);
        xhttp.send();
    })
});