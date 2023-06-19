import io from 'socket.io-client';
let socket:any
export const initiateSocket = () => {
  //  var ws = new WebSocket(`ws://127.0.0.1:8000/feed/transactions/6339b3e69ef04b3efbaa11be`);
  //console.log(`Connecting socket...`);
  //if (socket && room) socket.emit('join', room);
}
export const disconnectSocket = () => {
  //console.log('Disconnecting socket...');
  //if(socket) socket.disconnect();
}
/*export const subscribeToChat = (cb:any) => {
  if (!socket) return(true);
  socket.on('chat', msg => {
    console.log('Websocket event received!');
    return cb(null, msg);
  });
}
export const sendMessage = (room, message) => {
  if (socket) socket.emit('chat', { message, room });
}*/