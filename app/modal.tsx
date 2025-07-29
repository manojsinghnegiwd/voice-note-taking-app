import NoteCard from '@/components/note/NoteCard';
import { OPEN_AI_KEY } from '@/constants/keys';
import { addNote } from '@/store/note';
import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, StyleSheet, View } from "react-native";
import { useDispatch } from 'react-redux';

export default function Modal () {
    const [isRecording, setIsRecording] = useState<boolean>(true);
    const [audioURI, setAudioURI] = useState<string | null>(null);
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

    const dispatch = useDispatch();

    const saveNote = () => {
        const note = {
            id: new Date().getTime(),
            content: text,
            audioUri: audioURI,
            summary: '',
        }

        dispatch(addNote(note))
        router.back()
    }

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
                    <LottieView
                        autoPlay
                        style={{
                            width: 200,
                            height: 200
                        }}
                        source={require('../assets/animation.json')}
                    />
                )
            }
            {
                isRecording && (
                    <Button title='Stop' onPress={() => stopRecording()} />
                )
            }
            {
                loading && <ActivityIndicator size="large" />
            }
            {
                text && (
                    <NoteCard
                        content={text}
                        audioUri={audioURI}
                        onDelete={() => router.back()}
                    />
                )
            }
            {
                text && (
                    <Button title="Save" onPress={saveNote} />
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
        paddingLeft: 20,
        paddingRight: 20
    }
})