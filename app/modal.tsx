import { OPEN_AI_KEY } from '@/constants/keys';
import { AudioModule, RecordingPresets, useAudioPlayer, useAudioRecorder } from 'expo-audio';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Modal () {
    const [isRecording, setIsRecording] = useState<boolean>(true);
    const [audioURI, setAudioURI] = useState<string | null>(null);
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const player = useAudioPlayer(audioURI);

    const record = async () => {
        await recorder.prepareToRecordAsync();
        recorder.record();
        setIsRecording(true);
    }

    const stopRecording = async () => {
        await recorder.stop();
        setIsRecording(false);
        setAudioURI(recorder.uri)
        transcribeAudio(recorder.uri)
        console.log(recorder.uri)
    }

    const transcribeAudio = async (uri: string | null) => {
        if (!uri) {
            Alert.alert('No recording available')
            return;
        }

        setLoading(true);

        try {
            const fromData = new FormData();
            fromData.append('file', {
                uri: uri,
                name: 'recording-user.m4a',
                type: 'audio/m4a'
            } as any)
            fromData.append('model', 'gpt-4o-transcribe');
            fromData.append('response_format', 'text');

            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPEN_AI_KEY}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: fromData
            })

            const result = await response.text()
            setText(result);
        } catch (error) {
            console.log('error')
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setTimeout(async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert('Permission required for taking the note');
            } else {
                record();
            }
        }, 500)
    }, [])

    return (
        <View style={styles.container}>
            {
                isRecording && (
                    <TouchableOpacity onPress={() => stopRecording()}>
                        <Text>Stop Recording</Text>
                    </TouchableOpacity>
                )
            }
            {
                audioURI && (
                    <TouchableOpacity onPress={() => player.play()}>
                        <Text>Play recording</Text>
                    </TouchableOpacity>
                )
            }
            {
                loading && <ActivityIndicator size="large" />
            }
            {
                text && (
                    <Text>
                        {text}
                    </Text>
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    }
})