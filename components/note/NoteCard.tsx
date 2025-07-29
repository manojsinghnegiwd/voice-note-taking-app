import { OPEN_AI_KEY } from "@/constants/keys"
import { updateSummary } from "@/store/note"
import { Ionicons } from "@expo/vector-icons"
import { useAudioPlayer } from "expo-audio"
import { useState } from "react"
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useDispatch } from "react-redux"

interface NoteCardProps {
    id?: string,
    title?: string,
    content: string,
    audioUri?: string | null,
    onDelete: () => void
    summary?: string
}

export default function NoteCard(props: NoteCardProps) {
    const [isPlaying, setPlaying] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const player = useAudioPlayer(props.audioUri)
    const dispatch = useDispatch();

    const togglePlayer = () => {
        if (player.playing) {
            player.pause();
            setPlaying(false);
        } else {
            player.play()
            setPlaying(true);
        }
    }

    const handleSummarize = async () => {
        if (props.summary) {
            return;
        }

        setLoading(true)

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPEN_AI_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: "You are an assistant that summarizes text in a concise manner. Provide a brief summary in 1-2 sentences."
                        },
                        {
                            role: 'user',
                            content: `Summarise this note: ${props.content}`
                        }
                    ]
                })
            })

            const data = await response.json();
            const summary = data.choices[0].message.content.trim();
            dispatch(updateSummary({id: props.id, summary}))
        } catch (error) {
            Alert.alert('there is an error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.card}>
            <Text>{props.content}</Text>
            {
                loading && <ActivityIndicator size="large" />
            }
            {
                props.summary && (
                    <View style={styles.summaryContainer}>
                        <Text>{props.summary}</Text>
                    </View>
                )
            }
            <View style={styles.header}>
                <TouchableOpacity onPress={handleSummarize}>
                    <Ionicons name="document-text-outline" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePlayer}>
                    <Ionicons name={
                        isPlaying ? "pause" : "play"
                    } size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={props.onDelete}>
                    <Ionicons name="trash-outline" size={20} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        shadowColor: '#000',
        elevation: 2,
        shadowRadius: 4,
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 2
        }
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 6
    },
    summaryContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        padding: 12,
        marginTop: 4,
        marginBottom: 10
    }
})
