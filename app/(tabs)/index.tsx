import NoteCard from '@/components/note/NoteCard';
import { deleteNote } from '@/store/note';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function HomeScreen() {
  const notes = useSelector((state: any) => state.note.notes)
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentInsetAdjustmentBehavior='automatic'>
        {
          notes.map(
            (note: any, index: number) => <NoteCard id={note.id} summary={note.summary} onDelete={() => dispatch(deleteNote(note.id))} key={index} content={note.content} audioUri={note.audioUri} />
          )
        }
      </ScrollView>
      <TouchableOpacity style={styles.AddButton} onPress={() => router.push('/modal')}>
          <Text style={styles.AddButtonText}>Add Note</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  AddButton: {
    backgroundColor: '#333',
    padding: 10,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    position: "absolute",
    bottom: 100,
    right: 10
  },
  AddButtonText: {
    color: "white"
  },
  scrollView: {
    flex: 1,
    backgroundColor: "white",
    padding: 20
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20
  }
});
