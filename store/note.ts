import { createSlice } from "@reduxjs/toolkit";

interface Note {
    id: string,
    content: string,
    audioUri: string,
    summary?: string;
}

interface NoteState {
    notes: Note[]
}

const initialState: NoteState = {
    notes: []
}

export const noteSlice = createSlice({
    name: 'note',
    initialState,
    reducers: {
        addNote: (state, action) => {
            state.notes.push(action.payload);
        },
        deleteNote: (state, action) => {
            state.notes = state.notes.filter((note) => note.id !== action.payload)
        },
        updateSummary: (state, action) => {
            const { id, summary } = action.payload
            const noteIndex = state.notes.findIndex(note => note.id === id)
            if (noteIndex !== -1) {
                state.notes[noteIndex].summary = summary;
            }
        }
    }
})

export const { addNote, deleteNote, updateSummary } = noteSlice.actions;
export default noteSlice.reducer;
