import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/chathub') // Backend SignalR URL
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('Connected to SignalR Hub');

          connection.on('ReceiveMessage', (user, msg) => {
            setMessages((prev) => [...prev, { user, msg }]);
          });
        })
        .catch((e) => console.error('Connection failed: ', e));

      return () => {
        connection.off('ReceiveMessage'); // Event handler'ı kaldır
      };
    }
  }, [connection]);

  const sendMessage = async () => {
    if (connection) {
      try {
        await connection.invoke('SendMessage', username, message);
        setMessage('');
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Canlı Sohbet Uygulaması</h2>
      <div>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="text"
          placeholder="Mesajınızı yazın..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={sendMessage}>Gönder</button>
      </div>
      <div style={{ marginTop: 20 }}>
        <h3>Mesajlar</h3>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.user === username ? "Siz" : msg.user}:</strong> {msg.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
