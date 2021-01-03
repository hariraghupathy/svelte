<script context="module">
    export function preload(page) {
        console.log(page);
        return this.fetch('https://svelte-meetup-436e1-default-rtdb.firebaseio.com/meetups.json')
            .then((res) => {
                console.log(res);
                if(!res.ok) {
                    throw new Error('Fetching meetups failed, please try again !!');
                }
                // we have to return res.json to extract the data
                return res.json();
            })
            .then((data) => {
                const fetchedMeetups = [];
                for (const key in data) {
                    fetchedMeetups.push({
                        ...data[key],
                        id: key
                    });
                }
                return {fetchedMeetups: fetchedMeetups.reverse()};
                // setTimeout(() => {
                //     isLoading = false;
                //     meetups.setMeetups(loadedMeetups.reverse());
                // }, 1000);
            })
            .catch((err) => {
                error = err;
                isLoading = false;
                console.log('Error!'+err);
                this.error(500,'Could not fetch meetups');
                // this will bring us our error page
            });
    }
</script>
<script>
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import MeetupItem from '../components/Meetup/MeetupItem.svelte';
    import MeetupFilter from '../components/Meetup/MeetupFilter.svelte';
    import meetups from '../meetup-store';
    import Button from '../components/UI/Button.svelte';
    import { scale } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import EditMeetup from '../components/Meetup/EditMeetup.svelte';
    import LoadingSpinner from '../components/UI/LoadingSpinner.svelte';

    export let fetchedMeetups;
    let favsOnly = false;
    let editMode = null;
    let editedId;
    let isLoading;
    let unsubscribe;

    $: filteredMeetups = favsOnly ? fetchedMeetups.filter(m=>m.isFavorite) : fetchedMeetups;

    onMount(() => {
        // unsubscribe = meetups.subscribe(items =>  fetchedMeetups = items);
        // isLoading = true;
        meetups.setMeetups(fetchedMeetups);
        unsubscribe = meetups.subscribe(items => {
            fetchedMeetups = items;
        });
    });

    onDestroy(() => {
        if(unsubscribe) {
            unsubscribe();
        }
    });

    function setFilter(event) {
        favsOnly = event.detail === 1 ;
     }

     const dispatch = createEventDispatcher();

     function savedMeetup(event) {
        editMode = null;
        editedId = null;
    }

    function startEdit(event) {
        editMode = 'edit';
        editedId = event.detail;
    }

    function cancelEdit() {
        editMode = null;
        editedId = null;
    }

    function startAdd() {
        editMode = 'edit';
    }
</script>
<style>
    #meetups {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-gap: 1rem;
    }

    @media (min-width: 768px) {
        #meetups {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    #meetup-controls {
        margin: 1rem;
        display: flex;
        justify-content: space-between;
    }

    #no-meetups {
        margin: 1 rem;
    }
</style>

<svelte:head>
	<title>All meetups</title>
</svelte:head>

{#if editMode === 'edit'}
<EditMeetup 
    id={editedId} 
    on:save="{savedMeetup}"  
    on:cancel={cancelEdit}/>
{/if}
{#if isLoading}
<LoadingSpinner/>
{:else}
<section id="meetup-controls">
    <MeetupFilter on:select={setFilter}></MeetupFilter>
    <Button on:click={startAdd}>New Meetup</Button>
</section>

{#if filteredMeetups.length === 0}
    <p id="no-meetups">No meetups found, you can start adding some</p>
{/if}
<section id="meetups">
    {#each filteredMeetups as meetup (meetup.id)}
        <div transition:scale animate:flip={{duration:300}}>
            <MeetupItem 
                id={meetup.id}
                title={meetup.title}
                subtitle={meetup.subtitle}
                description={meetup.description}
                imageurl={meetup.imageUrl}
                email={meetup.contactEmail}
                address={meetup.address}
                isFav={meetup.isFavorite}
                on:showdetails
                on:edit={startEdit}
                >
            </MeetupItem>
        </div>
    {/each}
</section>

{/if}

