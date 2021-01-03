import { writable } from 'svelte/store';

const meetups = writable([]);

const customMeetupsStore = {
    subscribe: meetups.subscribe,
    setMeetups: (meetupArray) => {
        meetups.set(meetupArray);
    },
    addMeetup: (meetupData) => {
        const newMeetup = {
            ...meetupData
        };
        meetups.update(items => {
            return [newMeetup, ...items];
        });
    },
    updateMeetup: (id, meetupData) => {
        console.log(id, meetupData);
        meetups.update(items => {
            const meetupIndex = items.findIndex(i=>i.id === id);
            // the second parameter overrides the unpassed values with the existing values
            // isFavorite and id is not passed with the meetup data, so it overrides the existing values
            const updatedMeetup = {...items[meetupIndex], ...meetupData};
            const updatedMeetups = [...items];
            updatedMeetups[meetupIndex] = updatedMeetup;
            return updatedMeetups;
        });
    },
    removeMeetup: (id) => {
        meetups.update(items => {
            return items.filter(i => i.id !== id);
        });
    },
    toggleFavorite: (id) => {
        meetups.update(items => {
            const updatedMeetup = {...items.find(m=> m.id === id)};
            updatedMeetup.isFavorite = !updatedMeetup.isFavorite;
            const meetupIndex = items.findIndex(m=>m.id === id);
            const updatedMeetups = [...items];
            updatedMeetups[meetupIndex] = updatedMeetup;
            return updatedMeetups;
        });
    }
};

export default customMeetupsStore;