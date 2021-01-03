<script>
    import meetups from '../../meetup-store';
    import { createEventDispatcher } from 'svelte';
    import TextInput from '../UI/TextInput.svelte';
    import Button from '../UI/Button.svelte';
    import Modal from '../UI/Modal.svelte';
    import {isEmpty, isValidEmail} from '../../helpers/validation';

    // any variable declared with the labelled expression is automatically declared by Svelte
    // so no need to declare and initialize all these variables

    export let id = null;
    // in order to edit we need the id, so we are exporting the property
    // from here we will prepopulate the values from the store


    let title = '';
    // let titleValid = false;
    let subtitle = '';
    // let subtitleValid = false;
    let address = '';
    // let addressValid = false;
    let email = '';
    // let emailValid = false;
    let description = '';
    // let descriptionValid = false;
    let imageUrl = '';
    // let imageUrlValid = false;
    // let formIsValid = false;

    if(id) {
        // only if id is sent we will fetch from the store for the edit dialog
        // after fetching this for all the above properties we will pre-set the values
        const unsubscricbe = meetups.subscribe(items => {
            const selectedMeetup = items.find(i => i.id === id);
            title = selectedMeetup.title;
            subtitle = selectedMeetup.subtitle;
            address = selectedMeetup.address;
            email = selectedMeetup.contactEmail;
            description = selectedMeetup.description;
            imageUrl = selectedMeetup.imageUrl;
        });

        // we can unsubscribe this right after fetching the data from the store
        // because we don't need the data anymore
        unsubscricbe();
    }

    const dispatch = createEventDispatcher();

    $:titleValid = !isEmpty(title);
    $:subtitleValid = !isEmpty(subtitle);
    $:addressValid = !isEmpty(address);
    $:descriptionValid = !isEmpty(description);
    $:imageUrlValid = !isEmpty(imageUrl);
    $:emailValid = isValidEmail(email);
    $:formIsValid = 
        titleValid && 
        subtitleValid && 
        addressValid && 
        descriptionValid && 
        emailValid && 
        imageUrlValid;

    function submitForm() {
        let newMeetup = {
            title: title,
            subtitle: subtitle,
            description: description,
            imageUrl: imageUrl,
            contactEmail: email,
            address: address
        };
        // meetups.push(newMeetup);
        // meetups = [...meetups, newMeetup];
        // patch will override only existing data
        if(id) {
            fetch(`https://svelte-meetup-436e1-default-rtdb.firebaseio.com/meetups/${id}.json`, {
                method: 'PATCH',
                body: JSON.stringify(newMeetup),
                headers: {'Content-Type' : 'application/json'}
            }).then((res) => {
                    if(!res.ok) {
                        throw new Error('Failed!');
                    }
                    meetups.updateMeetup(id, newMeetup);
                }).catch(err => {
                console.log(err);
            });
        } else {
            fetch("https://svelte-meetup-436e1-default-rtdb.firebaseio.com/meetups.json", {
                method: 'POST',
                body: JSON.stringify({...newMeetup, isFavorite: false}),
                headers: {'Content-Type' : 'application/json'}
            }).then(
                (res) => {
                    if(!res.ok) {
                        throw new Error('Failed!');
                    }
                    return res.json();
                }
            ).then(
                (data) =>{
                    meetups.addMeetup({...newMeetup, isFavorite: false, id: data.name});
                }
            ).catch(err => {
                console.log(err);
            });
        }
        dispatch('save');
    }

    function cancel() {
        dispatch('cancel');
    }

    function deleteMeetup() {
        fetch(`https://svelte-meetup-436e1-default-rtdb.firebaseio.com/meetups/${id}.json`, {
            method: 'DELETE',
        }).then(res => {
            if(!res.ok) {
                throw new Error('Failed!');
            }
            meetups.removeMeetup(id);
        }).catch(err => console.log(err));
        dispatch("save");
    }
</script>

<style>
    form {
        width: 100%;
    }
</style>

<Modal title = "Edit Meetup Data" on:cancel>
    <form on:submit|preventDefault = { submitForm }>
        <TextInput 
            id="title" 
            label="Title" 
            value={title} 
            type="text"
            valid={titleValid}
            validityMessage="Please enter a valid title."
            on:input="{(event) => title = event.target.value}" />
        <TextInput 
            id="subtitle" 
            label="Subtitle" 
            value={subtitle} 
            type="text"
            valid={subtitleValid}
            validityMessage="Please enter a valid subtitle."
            on:input="{(event) => subtitle = event.target.value}" />
        <TextInput 
            id="address" 
            label="Address" 
            value={address} 
            type="text"
            valid={addressValid}
            validityMessage="Please enter a valid address."
            on:input="{(event) => address = event.target.value}" />
        <TextInput 
            id="imageurl" 
            label="Image URL" 
            value={imageUrl} 
            type="text"
            valid={imageUrlValid}
            validityMessage="Please enter a valid image url."
            on:input="{(event) => imageUrl = event.target.value}" />
        <TextInput 
            id="email" 
            label="E-mail" 
            type="email"
            value={email} 
            valid={emailValid}
            validityMessage="Please enter a valid email address."
            on:input="{(event) => email = event.target.value}" />
        <!-- <TextInput 
            id="description" 
            label="Description" 
            type="description"
            value={description} 
            rows="3"
            controlType='textarea'
            valid={descriptionValid}
            validityMessage="Please enter a valid description."
            on:input="{(event) => description = event.target.value}" /> -->

            <!-- When we are setting the type dynamically, we need to receive the bound value 
            as in the above commented syntax, if we are using bind then use the below code -->
        
         <TextInput 
            id="description" 
            label="Description" 
            type="description"
            rows="3"
            controlType='textarea'
            valid={descriptionValid}
            validityMessage="Please enter a valid description."
            bind:value={description} />
        
            <!-- <Button type="submit">Save</Button> -->
    </form>
    <div slot="footer">
        <Button type="button" mode="outline" on:click={cancel}>Cancel</Button>
        <Button type="button" on:click={submitForm} disabled={!formIsValid}>Save</Button>
        {#if id}
            <Button type="button" on:click={deleteMeetup}>Delete</Button>
        {/if}
    </div>
</Modal>