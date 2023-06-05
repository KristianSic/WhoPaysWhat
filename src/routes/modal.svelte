<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from './icon.svelte';
	export let initialState: any;
	export let formState: any;
	export let hasConfirm: boolean = true;
	export let onSubmit = (oldState: any, newState: any) => null;
	let modal: any;
	function initializeFormState() {
		formState = new Proxy(
			{ ...initialState },
			{
				get: Reflect.get,
				set: (target, prop, value) => {
					target[prop] = value;
					return true;
				},
			}
		);
	}

	export function closeModal() {
		modal.close();
	}

	export function handleSubmit(event: any) {
		event.preventDefault();
		modal.close();
		return onSubmit({ ...initialState }, { ...formState });
	}

	export function openModal() {
		modal.showModal();
	}

	onMount(() => initializeFormState());
</script>

<dialog bind:this={modal} class="dialog">
	<div class="modal">
		<div class="modal__header">
			<slot name="title" />
			<button class="btn btn--round" type="button" on:click={closeModal}>
				<Icon icon={'close'} />
			</button>
		</div>
		<div class="modal__content">
			<slot {formState} />
		</div>
		{#if hasConfirm}
			<div class="modal__footer">
				<button class="btn btn--round" type="button" on:click={handleSubmit}>
					<Icon icon={'check'} />
				</button>
			</div>
		{/if}
	</div>
</dialog>

<style lang="less">
	dialog {
		padding: 10px !important;
		width: min(400px, 100% - 4rem);
	}
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.4);
	}
	.modal {
		display: flex;
		flex-direction: column;
		gap: 10px;
		&__content {
			padding: 5px;
		}
		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 10px;
		}
		&__footer {
			display: flex;
			gap: 5px;
			justify-content: flex-end;
		}
	}
</style>
