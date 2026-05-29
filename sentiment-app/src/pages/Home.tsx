import React, { useState, useEffect } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButton, IonIcon, IonCard, IonCardContent, IonText, IonLoading
} from '@ionic/react';
import { happyOutline, smileOutline, removeCircleOutline, 
         sadOutline, alertCircleOutline, thunderstormOutline, closeOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import './Home.css';

const sentiments = [
  { level: 6, label: 'Muito Feliz', icon: happyOutline, color: '#22c55e', bg: '#dcfce7' },
  { level: 5, label: 'Feliz', icon: smileOutline, color: '#84cc16', bg: '#ecfccb' },
  { level: 4, label: 'Bem', icon: removeCircleOutline, color: '#eab308', bg: '#fef9c3' },
  { level: 3, label: 'Preocupado', icon: sadOutline, color: '#f97316', bg: '#ffedd5' },
  { level: 2, label: 'Ansioso', icon: alertCircleOutline, color: '#ef4444', bg: '#fee2e2' },
  { level: 1, label: 'Nervoso', icon: thunderstormOutline, color: '#dc2626', bg: '#fecaca' },
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
      // Salvar no Supabase
      const { error } = await supabase
        .from('sentiment_records')
        .insert([{ 
          sentiment_level: level, 
          session_id: getSessionId() 
        }]);

      if (error) throw error;

      // Buscar mensagem aleatória de apoio
      const { data: messages, error: msgError } = await supabase
        .from('support_messages')
        .select('message')
        .eq('active', true);

      if (msgError) throw msgError;

      if (messages && messages.length > 0) {
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        setSupportMessage(randomMsg.message);
      }

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

            <div className="sentiment-grid">
              {sentiments.map((s) => (
                <button
                  key={s.level}
                  className={`sentiment-btn ${selectedSentiment === s.level ? 'selected' : ''}`}
                  style={{ 
                    backgroundColor: s.bg,
                    borderColor: s.color 
                  }}
                  onClick={() => handleSentimentClick(s.level)}
                >
                  <IonIcon icon={s.icon} style={{ color: s.color, fontSize: '48px' }} />
                  <span className="sentiment-label" style={{ color: s.color }}>
                    {s.label}
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
                  <IonIcon slot="start" icon={closeOutline} />
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