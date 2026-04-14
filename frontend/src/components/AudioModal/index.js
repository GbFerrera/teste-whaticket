import React, { useRef, useEffect, useState } from "react";
import { IconButton, Slider, Avatar } from "@material-ui/core";
import { PlayArrow, Pause, Speed, VolumeUp, VolumeOff } from "@material-ui/icons";
import styled, { keyframes } from "styled-components";

const LS_NAME = 'audioMessageRate';

// Container principal do player - layout horizontal igual ao WhatsApp
const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  padding: 0;
  width: 100%;
  max-width: 300px;
`;

// Avatar do usuário
const UserAvatar = styled(Avatar)`
  width: 32px;
  height: 32px;
`;

// Botão de play/pause estilizado
const PlayPauseButton = styled(IconButton)`
  background-color: transparent;
  padding: 4px;
  color: #00a884;

  &:hover {
    background-color: rgba(0, 168, 132, 0.1);
  }

  .MuiSvgIcon-root {
    font-size: 28px;
  }
`;

// Container da barra de progresso e tempo
const ProgressContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// Barra de progresso estilizada
const ProgressBar = styled(Slider)`
  color: #00a884;
  padding: 0 !important;
  height: 4px;

  .MuiSlider-thumb {
    width: 10px;
    height: 10px;
    background-color: #00a884;
    display: none;
  }

  .MuiSlider-track {
    background-color: #00a884;
    height: 4px;
    border-radius: 2px;
  }

  .MuiSlider-rail {
    background-color: rgba(0, 168, 132, 0.2);
    height: 4px;
    border-radius: 2px;
  }

  &:hover .MuiSlider-thumb {
    display: block;
  }
`;

// Exibição do tempo
const TimeDisplay = styled.div`
  font-size: 11px;
  color: #667781;
  font-weight: 400;
  text-align: right;
`;

// Função para formatar o tempo em mm:ss
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const AudioModal = ({ url, avatarUrl, userName }) => {
    const audioRef = useRef(null);
    const [audioRate, setAudioRate] = useState(parseFloat(localStorage.getItem(LS_NAME) || "1"));
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Atualiza a taxa de reprodução no localStorage
    useEffect(() => {
        audioRef.current.playbackRate = audioRate;
        localStorage.setItem(LS_NAME, audioRate);
    }, [audioRate]);

    // Atualiza o tempo atual e a duração do áudio
    useEffect(() => {
        const audio = audioRef.current;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    // Alternar entre play e pause
    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    // Alternar a velocidade de reprodução
    const toggleRate = () => {
        const rates = [0.5, 1, 1.5, 2];
        const currentIndex = rates.indexOf(audioRate);
        const newRate = rates[(currentIndex + 1) % rates.length];
        setAudioRate(newRate);
    };

    // Atualizar o volume
    const handleVolumeChange = (event, newValue) => {
        setVolume(newValue);
        audioRef.current.volume = newValue;
        setIsMuted(newValue === 0);
    };

    // Alternar entre mudo e desmudo
    const toggleMute = () => {
        if (isMuted) {
            audioRef.current.volume = volume;
        } else {
            audioRef.current.volume = 0;
        }
        setIsMuted(!isMuted);
    };

    // Atualizar o tempo do áudio ao arrastar a barra de progresso
    const handleSeek = (event, newValue) => {
        audioRef.current.currentTime = newValue;
        setCurrentTime(newValue);
    };

    // Obter a fonte do áudio (compatível com iOS)
    const getAudioSource = () => {
        let sourceUrl = url;

        if (isIOS) {
            sourceUrl = sourceUrl.replace(".ogg", ".mp3");
        }

        return (
            <source src={sourceUrl} type={isIOS ? "audio/mp3" : "audio/ogg"} />
        );
    };

    return (
        <PlayerContainer>
            <UserAvatar src={avatarUrl} alt={userName}>
                {!avatarUrl && userName?.charAt(0).toUpperCase()}
            </UserAvatar>
            <PlayPauseButton onClick={togglePlayPause}>
                {isPlaying ? <Pause /> : <PlayArrow />}
            </PlayPauseButton>
            <ProgressContainer>
                <ProgressBar
                    value={currentTime}
                    max={duration}
                    onChange={handleSeek}
                    aria-labelledby="audio-seek-slider"
                />
                <TimeDisplay>
                    {formatTime(currentTime)} / {formatTime(duration)}
                </TimeDisplay>
            </ProgressContainer>
            <IconButton 
                onClick={toggleRate} 
                size="small"
                style={{ 
                    padding: 4,
                    color: '#00a884',
                    fontSize: 11,
                    fontWeight: 600
                }}
                title={`Velocidade: ${audioRate}x`}
            >
                <span style={{ fontSize: 11, fontWeight: 600 }}>{audioRate}x</span>
            </IconButton>
            <audio ref={audioRef} style={{ display: "none" }}>
                {getAudioSource()}
            </audio>
        </PlayerContainer>
    );
};

export default AudioModal;