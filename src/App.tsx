function handleUpdateDrug(drugId, notes) {
    // Validate input notes
    if (!notes || typeof notes !== 'string' || notes.trim() === '') {
        console.error('Invalid notes provided');
        alert('Please provide valid notes.');
        return;
    }

    try {
        // Assume updateDrug is a function that updates the drug notes in your application
        updateDrug(drugId, notes);

        // Try to save to localStorage
        localStorage.setItem(`drug_${drugId}_notes`, notes);
        console.log('Notes saved successfully!');
    } catch (error) {
        console.error('Failed to save notes to localStorage:', error);
        alert('Failed to save notes. Please try again.');
    }
}