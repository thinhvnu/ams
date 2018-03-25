
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

function createNewChatBox(user) {
    /**
     * Check exist chatbox
     */
    let chatBoxItem = document.getElementById('chat-box-item-' + user.id);
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
    chatBox.id = 'chat-box-item-' + user.id;
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
    boxTitle.textContent = user.firstName + ' ' + user.lastName;
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
    let avata = document.createElement('span');
    avata.className = 'avatar';
    avata.style = 'position: absolute;z-index: 200;width: 54px;height: 54px;float: left;left: 15px;top: 15px;background: #ccc;border-radius:3px;border: 1px solid #eee;';
    chatBoxHeader.appendChild(avata);

    /**
     * Header account
     */
    let account = document.createElement('div');
    account.className = 'account';
    account.style = 'position: relative;height: 44px;padding-left: 85px;padding-top: 3px;background: #fff;z-index: 1;border-bottom: 1px solid #eee;'
    chatBoxHeader.appendChild(account);

    let accountName = document.createElement('div');
    accountName.className = 'account-name';
    accountName.style = 'height: 16px;line-height: 16px;color:#1874ba;font-weight:bold;';
    accountName.textContent = user.email;
    account.appendChild(accountName);

    let hotline = document.createElement('div');
    hotline.className = 'hotline';
    hotline.textContent = 'SĐT: ' + user.phoneNumber; 
    hotline.style = 'color: #aaaaaa';
    account.appendChild(hotline);

    let settingEl = document.createElement('span');
    settingEl.className = 'setting';
    settingEl.style = 'position: absolute;float:right;right:10px;top: 13px;width: 16px;height:16px;background:url(/images/chat-icons-v1.png);background-position: -108px 0px';
    account.appendChild(settingEl);

    /**
     * Create chat box content
     */
    let chatBoxContent = document.createElement('div');
    chatBoxContent.className = 'chat-box-content';
    chatBoxContent.id = 'chat-box-content';
    chatBoxContent.style = 'height: ' + boxContentHeight + 'px; background: #e5e5e5; overflow-y: auto;padding: 15px;';
    chatBox.appendChild(chatBoxContent);

    /* === Request server get list message ===*/
    let getMessageUrl = '/api/chat/messages/' + user.id;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(xhttp.readyState == 4 && xhttp.status == 200) {
            let dataRes = JSON.parse(this.response);

            console.log('dataRes', dataRes);
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
    inputMessage.placeholder = 'Enter new message';
    inputMessage.style = 'padding: 0 5px; width: ' + (boxWidth - 48) + 'px;height: ' + boxFooterHeight/2 + 'px; line-height: ' + boxFooterHeight/2 + 'px; resize: none;border:none;'
                        + '; box-sizing: border-box;';
    inputMessage.onkeydown = function(e) {
        var code = e.keyCode ? e.keyCode : e.which;
        if (code == 13 && !e.shiftKey) {  // Enter keycode
            let sendMessBtn = document.getElementById('send-message');
            sendMessBtn.click();
            return false;
        }
    }
    mainFooterContainer.appendChild(inputMessage);

    let btnSend = document.createElement('button');
    btnSend.className = 'send-message';
    btnSend.style = 'width: 40px; height: 25px; border: none; margin-top: 5px; background: url(/images/chat-icons-v1.png); background-position: -70px 0px;box-sizing: border-box; vertical-align: top;';
    btnSend.onclick = function() {
        console.log('socket', socket);
        let messval = inputMessage.value;
        let messageItem = document.createElement('div');
        messageItem.style = 'text-align: right;';
        messageItem.className = 'message-item mess-send';

        let messageItemContent = document.createElement('div');
        messageItemContent.className = 'mess-item-content';
        messageItemContent.style = 'display: inline-block;background: #4080ff;color: #ffffff;padding: 5px 10px;margin-bottom: 5px;border-top-left-radius: 15px;border-bottom-left-radius: 15px; border-top-right-radius: 15px;';
        messageItemContent.textContent = messval;

        messageItem.appendChild(messageItemContent);
        chatBoxContent.appendChild(messageItem);
    }
    mainFooterContainer.appendChild(btnSend);

    // document.body.appendChild(chatBox);
    /**
     * Append chatbox to container
     */
    let chatWrap = document.getElementById('chat-wrap');
    if (!chatWrap) {
        chatWrap = document.createElement('div');
        chatWrap.id = 'chat-wrap';
        chatWrap.style = 'position: fixed;width: 100%;bottom: 0;padding-right: 15px;';
        document.body.appendChild(chatWrap);
    }
    chatWrap.appendChild(chatBox);
}

/*
* Connect socket
*/
const token = getCookie('ams_token');
const socket = io('http://localhost:6888', {query: 'token=' + token});

socket.on('connect', () => {
    socket.on('join_chat_successfully', (data) => {
        console.log('data');
        socket.identification = data;
    });
});