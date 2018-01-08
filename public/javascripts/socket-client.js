const token = localStorage.getItem('ams_chat_token');
const socket = io('http://192.168.1.154:6888', {query: 'token=' + token});

socket.on('connect', () => {
    let data = localStorage.getItem('account');

    data = data ? JSON.parse(data) : null;

       /**
     * Show list customers
     */
    socket.on('join_chat_successfully', (data) => {
        localStorage.setItem('owner', data);

        let sendMessage = document.getElementById('send-message');
        sendMessage.onclick = function() {
            let messText = document.getElementById('message-input');
            let sendTo = {
                room: '5a5377a4750d0836452a4371',
                userName: 'client1'
            }

            if (data.userName === 'client1') {
                sendTo = {
                    room: '5a5377c2750d0836452a4372',
                    userName: 'client2'
                }
            }

            let dataSend = {
                sender: data,
                to: sendTo,
                messageContent: messText.value
            }
            socket.emit('send_message', dataSend);
            messText.value = '';
        }.bind(data, socket);

        /**
         * Event receive message from server
         */
        socket.on('owner_message', (data) => {
            let messEl = document.createElement('li');
            messEl.textContent = data.messageContent;
            document.getElementById('message-container').appendChild(messEl);
        })

        /**
         * Event receive message from server
         */
        socket.on('message', (data) => {
            let messEl = document.createElement('li');
            messEl.textContent = data.messageContent;
            messEl.style = 'color: red;';
            document.getElementById('message-container').appendChild(messEl);
        })
    });

    /**
     * Event socket disconnect
     */
    socket.on('disconnect', () => {
        console.log('socket was disconnected');
    });
});
