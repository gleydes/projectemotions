import React, { useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButton, IonCard, IonCardContent, IonText, IonLoading
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { saveSentiment, getSupportMessage } from '../apiClient';
import './Home.css';

const sentiments = [
  { level: 5, label: 'Sobrecarregado', emoji: '😭', color: '#dc2626', bg: '#fee2e2' },
  { level: 4, label: 'Muito Ansioso', emoji: '😰', color: '#f97316', bg: '#ffedd5' },
  { level: 3, label: 'Cansado', emoji: '😔', color: '#eab308', bg: '#fef9c3' },
  { level: 2, label: 'Bem', emoji: '😐', color: '#84cc16', bg: '#ecfccb' },
  { level: 1, label: 'Tranquilo', emoji: '😊', color: '#22c55e', bg: '#dcfce7' },
];

const Home: React.FC = () => {
  const [selectedSentiment, setSelectedSentiment] = useState<number | null>(null);
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [showThanks, setShowThanks] = useState(false);
  const [loading, setLoading] = useState(false);

  const getSessionId = () => {
    let id = localStorage.getItem('session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('session_id', id);
    }
    return id;
  };

  const handleSentimentClick = async (level: number) => {
  setLoading(true);
  setSelectedSentiment(level);

  try {
    // Salvar no Google Sheets via Apps Script
    const result = await saveSentiment({
      sentiment_level: level,
      sentiment_label: sentiments.find(s => s.level === level)?.label || '',
      session_id: getSessionId(),
    });

    if (result.status !== 'success') {
      throw new Error(result.message);
    }

    // Buscar mensagem de apoio
    const msg = await getSupportMessage();
    setSupportMessage(msg);

    setShowThanks(true);
  } catch (err) {
    console.error('Erro:', err);
    setSupportMessage('Obrigado por compartilhar! Cuide-se bem. 💚');
    setShowThanks(true);
  } finally {
    setLoading(false);
  }
};

  const resetApp = () => {
    setShowThanks(false);
    setSelectedSentiment(null);
    setSupportMessage('');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>🌡️ Termômetro de Sentimento</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message="Registrando..." />

        {!showThanks ? (
          <div className="sentiment-container">
            <h2 className="question">Como você está se sentindo hoje?</h2>
            <p className="subtitle">Toque no emoji que melhor representa seu momento</p>

            <div className="thermometer-list">
              {sentiments.map((s) => (
                <button
                  key={s.level}
                  className={`thermometer-item ${selectedSentiment === s.level ? 'selected' : ''}`}
                  style={{ 
                    backgroundColor: s.bg,
                    borderColor: s.color 
                  }}
                  onClick={() => handleSentimentClick(s.level)}
                >
                  <span className="thermometer-emoji">{s.emoji}</span>
                  <span className="thermometer-label" style={{ color: s.color }}>
                    <span className="thermometer-number">{s.level}</span> - {s.label}
                  </span>
                </button>
              ))}
            </div>

            <p className="anonymous-note">🔒 Sua resposta é totalmente anônima</p>
          </div>
        ) : (
          <div className="thanks-container">
            <IonCard className="thanks-card">
              <IonCardContent>
                <div className="thanks-header">
                  <h1>Obrigado! 💚</h1>
                  <p>Sua resposta foi registrada com sucesso.</p>
                </div>

                <div className="message-box">
                  <IonText color="medium">
                    <h3>✨ Mensagem do dia</h3>
                  </IonText>
                  <p className="support-text">"{supportMessage}"</p>
                </div>

                <IonButton 
                  expand="block" 
                  color="primary" 
                  onClick={resetApp}
                  className="restart-btn"
                >
                  Registrar Novo Sentimento
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;