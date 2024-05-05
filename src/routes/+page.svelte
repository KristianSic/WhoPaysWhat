<script lang="ts">
	import { tick } from 'svelte';
	import yugo from '../yugo.json';
	import Modal from './modal.svelte';
	import Icon from './icon.svelte';
	import { base } from '$app/paths';
	
	let enterTarget: HTMLElement | any = null;
	let receiptItemModal: Modal;
	let receiptItemParticipantModal: Modal;

	let receipt = yugo;
	let imageSrc = `${base}/test-receipt.jpeg`

	const rating = ['🤨', '🙅‍♂️', '😒', '🤔', '😐', '🙂', '😄', '😁', '🤩', '🙌', '🎉'];

	$: percent = Math.floor(remaining / total + remaining);
	$: emojiIndex = Math.max(Math.floor((100 - percent) / 10), 0);
	$: emoji = rating[emojiIndex || 0];

	$: total = participants.reduce((sum: number, participant: Participant) => {
		const participantSum: number = Object.values(participant.receipt).reduce(
			(receiptSum: number, item: ReceiptItem) => receiptSum + item.quantity * item.price,
			0
		);
		return sum + participantSum;
	}, 0);

	$: remaining = Object.values(receiptItems).reduce(
		(sum: number, item: ReceiptItem) => sum + item.quantity * item.price,
		0
	);

	interface ReceiptItem {
		quantity: number;
		price: number;
	}

	interface Participant {
		name: string;
		receipt: { [key: string]: ReceiptItem };
	}

	let supplier_name = '';
	let receiptItems: { [key: string]: ReceiptItem } = {};
	let participants: Participant[] = [];

	function fetchData() {
		supplier_name = receipt.prediction.supplier_name.value;
		receiptItems = receipt.prediction.line_items.reduce((output: any, { description, quantity, unit_price }) => {
			output[description] = { quantity, price: unit_price };
			return output;
		}, {});

		participants = [
			{
				name: 'Kristian',
				receipt: {
					KAJMAK: {
						quantity: 3,
						price: 2,
					},
					NIKSICKO: {
						quantity: 1,
						price: 2.5,
					},
				},
			},
			{
				name: 'Matjaž',
				receipt: {},
			},
		];
	}

	function addToParticipant(itemTitle: string) {
		formState.name = itemTitle;
		receiptItemParticipantModal.openModal();
	}

	function ReceiptItemIncrementor(receiptItemTitle: string, quantity = 1, copy: ReceiptItem | null = null) {
		const receiptItem = receiptItems[receiptItemTitle];

		if (receiptItem) {
			receiptItem.quantity += quantity;
		} else {
			(receiptItems[receiptItemTitle] as ReceiptItem) = {
				quantity: quantity,
				price: copy ? copy.price : 0,
			};
		}
		receiptItems = receiptItems;
		return receiptItemTitle;
	}

	function ReceiptItemDecrementor(receiptItemTitle: string) {
		const receiptItem = receiptItems[receiptItemTitle];
		const card = document.querySelector(`.item[title="${receiptItemTitle}"]`) as HTMLElement;
		receiptItem.quantity -= 1;
		if (receiptItem.quantity == 0) {
			card.style.transform = 'scale(0.1)';
			setTimeout(() => {
				card.style.transform = '';
				delete receiptItems[receiptItemTitle];
				receiptItems = receiptItems;
			}, 100);
		}
		receiptItems = receiptItems;
	}

	function incrementLineItem(receiptItemTitle: string) {
		ReceiptItemIncrementor(receiptItemTitle);
	}

	function decrementLineItem(receiptItemTitle: string) {
		ReceiptItemDecrementor(receiptItemTitle);
	}

	async function addLineItem() {
		const name = ReceiptItemIncrementor('Lorem Ipsum');
		await tick();
		openModal(name, receiptItems[name]);
	}

	function decreaseParticipantItem(participant: Participant, receiptItemTitle: string, quantity = 1) {
		participant.receipt[receiptItemTitle].quantity -= quantity;
		if (participant.receipt[receiptItemTitle].quantity <= 0) {
			const card = document.querySelector(`.participant-items-item[title="${receiptItemTitle}"]`) as HTMLElement;
			card.style.transform = 'scale(0.1)';
			setTimeout(() => {
				card.style.transform = '';
				delete participant.receipt[receiptItemTitle];
				participants = participants;
			}, 100);
		}
		participants = participants;
	}

	function increaseParticipantItem(participant: Participant, receiptItemTitle: string, receiptItem: ReceiptItem) {
		const participantItem = participant.receipt[receiptItemTitle];
		if (participantItem) {
			participant.receipt[receiptItemTitle].quantity += 1;
		} else {
			participant.receipt[receiptItemTitle] = {
				quantity: 1,
				price: receiptItem.price,
			};
		}
		participants = participants;
	}

	function minusParticipantItem(participant: Participant, receiptItemTitle: string, quantity = 1) {
		const copy = participant.receipt[receiptItemTitle];
		decreaseParticipantItem(participant, receiptItemTitle, quantity);
		ReceiptItemIncrementor(receiptItemTitle, quantity, copy);
	}

	async function addParticipant() {
		participants.push({
			name: 'Lorem Ipsum',
			receipt: {},
		});
		participants = participants;
		await tick();
		const cards = document.querySelectorAll('.participant-card');
		const card = cards[cards.length - 1];
		card.querySelector('input')?.select();
	}

	function eraseParticipant(participant: Participant) {
		for (const [itemTitle, receiptItem] of Object.entries(participant.receipt)) {
			minusParticipantItem(participant, itemTitle, receiptItem.quantity);
		}
	}
	function removeParticipant(participant: Participant, index: number) {
		const card = document.querySelectorAll('.participant-card')[index] as HTMLElement;
		card.style.transform = 'scale(0.1)';
		setTimeout(() => {
			card.style.transform = '';
			eraseParticipant(participant);
			participants = participants.filter((p) => p != participant);
		}, 100);
	}

	function formatCurr(num: number) {
		return (Math.round(num * 100) / 100).toFixed(2).replace('.', ',') + ' ' + receipt.prediction.locale.currency;
	}

	function SumReceipt(receipt: { [key: string]: ReceiptItem }) {
		return Object.values(receipt).reduce((sum: number, item: ReceiptItem) => sum + item.quantity * item.price, 0);
	}

	function dragStart(e: any) {
		e.dataTransfer.setData('title', e.target.getAttribute('title'));
	}

	function handleDragOver(e: any) {
		e.preventDefault();
	}

	function handleDragEnter(event: any) {
		enterTarget = event.target;
		event.stopPropagation();
		event.preventDefault();
		document.querySelectorAll('.drag-over').forEach((e) => e.classList.remove('drag-over'));
		event.currentTarget.classList.add('drag-over');
		return false;
	}

	function handleDragLeave(event: any) {
		if (enterTarget == event.target) {
			event.stopPropagation();
			event.preventDefault();
			event.currentTarget.classList.remove('drag-over');
			enterTarget = null;
		}
		event.stopPropagation();
	}

	function handleDrop(e: any) {
		const receiptItemTitle = e.dataTransfer.getData('title');
		const targetIndex = e.target.closest('.participant-card').getAttribute('index');
		const participant = participants[targetIndex];
		giveReceiptItemToParticipant(participant, receiptItemTitle);
		e.currentTarget.classList.remove('drag-over');
		enterTarget = null;
		e.preventDefault();
	}

	function giveReceiptItemToParticipant(participant: Participant, receiptItemTitle: string) {
		increaseParticipantItem(participant, receiptItemTitle, receiptItems[receiptItemTitle]);
		decrementLineItem(receiptItemTitle);
	}

	function openModal(title: string, item: ReceiptItem) {
		initialState.name = title;
		formState.name = title;
		formState.price = item.price;
		receiptItemModal.openModal();
	}

	let formState = {} as any;
	let initialState = {} as any;

	function onSubmit(originalData: { name: string }, newData: { name: string; price: string }): any {
		const newPrice = Number(newData.price);
		receiptItems[originalData.name].price = newPrice;
		participants.forEach((p) => {
			for (const [itemTitle, receiptItem] of Object.entries(p.receipt)) {
				if (itemTitle == originalData.name) {
					receiptItem.price = newPrice;
				}
			}
		});
		receiptItems = Object.fromEntries(
			Object.entries(receiptItems).map(([key, value]) => {
				if (key == originalData.name) {
					return [`${newData.name}`, value];
				}
				return [`${key}`, value];
			})
		);
		participants = participants.map((p) => {
			p.receipt = Object.fromEntries(
				Object.entries(p.receipt).map(([key, value]) =>
					key == originalData.name ? [`${newData.name}`, value] : [`${key}`, value]
				)
			);
			return p;
		});
		participants = participants;
	}

	function handleSubmit(participant: Participant, receiptItemTitle: string): any {
		giveReceiptItemToParticipant(participant, receiptItemTitle);
		receiptItemParticipantModal.closeModal();
	}

	function openFilePicker() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (event:any) => {
			const file = event.target.files[0];
			imageSrc = URL.createObjectURL(file);
		});
    fileInput.click();
	}

	fetchData();
</script>

<main>
	<div class="title">
		<input type="text" bind:value={supplier_name} />
	</div>
	<div class="header">
		<div class="header__left">
			<div class="items">
				{#each Object.entries(receiptItems) as [title, receiptItem]}
					<div {title} class="item" on:dragstart={dragStart} draggable="true">
						<div class="item__btns">
							<button class="btn btn--round" type="button" on:click={() => incrementLineItem(title)}>
								<Icon icon={'plus'} />
							</button>
							<button class="btn btn--round" type="button" on:click={() => openModal(title, receiptItem)}>
								<div class="item__quantity">
									<div>{receiptItem.quantity}</div>
								</div>
							</button>
							<button class="btn btn--round" type="button" on:click={() => decrementLineItem(title)}>
								<Icon icon={'minus'} />
							</button>
						</div>
						<div class="item__description">
							<div>{title}</div>
						</div>
						<div class="item__btns">
							<button class="btn btn--round" type="button" on:click={() => addToParticipant(title)}>
								<Icon icon={'person'} />
							</button>
						</div>
					</div>
				{/each}
				<button class="btn--big" type="button" on:click={() => addLineItem()}>
					<Icon icon={'plus'} />
				</button>
			</div>

			<br />
			<hr />
			<br />
			<div class="participants">
				{#each participants as participant, index}
					<div
						{index}
						class="participant-card"
						on:drop={handleDrop}
						on:dragover={handleDragOver}
						on:dragenter={handleDragEnter}
						on:dragleave={handleDragLeave}
					>
						<div class="participant-card__header">
							<div class="participant-card__name">
								<input type="text" bind:value={participant.name} />
							</div>
							{#if Object.keys(participant.receipt).length}
								<button class="btn--round" type="button" on:click={() => eraseParticipant(participant)}>
									<Icon icon={'erase'} />
								</button>
							{/if}
							<button
								class="btn--round"
								type="button"
								on:click={() => removeParticipant(participant, index)}
							>
								<Icon icon={'delete'} />
							</button>
						</div>
						{#if Object.keys(participant.receipt).length}
							<div class="participant-items">
								{#each Object.entries(participant.receipt) as [title, receiptItem]}
									<div class="participant-items-item" {title}>
										<div class="participant-items-item__title">
											{receiptItem.quantity} x {title} :
											<strong>
												{formatCurr(receiptItem.quantity * receiptItem.price)}
											</strong>
										</div>
										<div class="participant-items-item__remove">
											<button
												class="btn"
												type="button"
												on:click={() => minusParticipantItem(participant, title)}
											>
												<Icon icon={'minus'} />
											</button>
										</div>
									</div>
								{/each}
							</div>
						{/if}
						{#if Object.keys(participant.receipt).length}
							<hr />
							<div class="participant-card__total">
								<strong>Total:</strong>
								{formatCurr(SumReceipt(participant.receipt))}
							</div>
						{/if}
					</div>
				{/each}
				<button class="btn--big" type="button" on:click={() => addParticipant()}>
					<Icon icon={'plus'} />
				</button>
			</div>
			<br />
			<hr />
			<br />
		</div>
		<div class="header__right">
			<div class="receipt-image">
				<div class="tilting-card-content" on:click={openFilePicker}>
					<img class="img" alt="receipt" src="{imageSrc}" />
					<div class="mouse-position-tracker">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="stats">
		<div class="stats__rating">{emoji}</div>
		<div class="stats__number">
			<div><strong>Total: </strong> {formatCurr(total)}</div>
			<hr />
			<div><strong>Remaining:</strong> {formatCurr(remaining)}</div>
		</div>
	</div>

	<Modal bind:this={receiptItemModal} {onSubmit} {initialState} bind:formState>
		<div class="input-title" slot="title"><input bind:value={formState.name} /></div>
		<div class="modal-price-input">
			<input type="number" bind:value={formState.price} />
			<span>{receipt.prediction.locale.currency}</span>
		</div>
	</Modal>

	<Modal bind:this={receiptItemParticipantModal} {initialState} bind:formState hasConfirm={false}>
		<span slot="title"> Choose participant </span>
		<div class="modal-card-container">
			{#each participants as participant}
				<div class="modal-card" on:click={handleSubmit(participant, formState.name)}>{participant.name}</div>
			{/each}
		</div>
	</Modal>
</main>

<style lang="less">
	main {
		width: min(1000px, 100% - 4rem);
		margin-inline: auto;
		margin-bottom: 20px;
		--btn: #fff;
		--card: #e6e6e6;
		--participant: #f3f3f4;
	}

	.title {
		input {
			overflow: hidden;
			text-overflow: ellipsis;
			width: 100%;
			display: block;
			font-size: 2em;
			margin-block-start: 0.67em;
			margin-block-end: 0.67em;
			margin-inline-start: 0px;
			margin-inline-end: 0px;
			font-weight: bold;
			border: none;
			padding: 5px 10px;
		}
		text-decoration: underline;
	}

	.header {
		display: flex;
		justify-content: space-between;
		gap: 25px;
		flex-wrap: wrap-reverse;
		&__left {
			flex: 1;
		}
		.receipt-image {
			height: 400px;
			width: 300px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 5px;
			img {
				border-radius: 5px;
			}
		}
	}

	.participants {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		button {
			margin: auto 0;
		}
		.participant-card {
			max-width: 310px;
			border: 1px solid;
			padding: 10px;
			border-radius: 5px;
			height: fit-content;
			display: flex;
			flex-direction: column;
			gap: 10px;
			background: var(--participant);
			transition: all 0.1s ease-in-out;
			&__header {
				display: flex;
				align-items: center;
				gap: 10px;
				button {
					flex-shrink: 0;
					width: 25px;
					height: 25px;
					border-radius: 50%;
					font-size: 30px;
				}
			}
			&__name {
				width: 100%;
				input {
					padding: 5px 10px;
					font-size: 20px;
					border: none;
					width: 100%;
					height: 100%;
				}
			}
		}
	}

	.items {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		align-items: center;
		.item {
			border: 1px solid;
			padding: 5px 8px;
			display: flex;
			gap: 10px;
			background: var(--card);
			border-radius: 50px;
			transition: all 0.1s ease-in-out;
			&__quantity {
				display: flex;
				align-items: center;
				justify-content: center;
			}
			&__description {
				display: flex;
				align-items: center;
				justify-content: center;
			}
			&__btns {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 5px;
			}
		}
	}

	.participant-items {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 5px;
		.participant-items-item {
			padding: 5px 10px;
			padding-right: 5px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 5px;
			border: 1px solid;
			border-radius: 5px;
			background: var(--card);
			transition: all 0.1s ease-in-out;
			font-size: 1rem;
			button {
				width: 25px;
				height: 25px;
				border-radius: 50%;
				font-size: 30px;
			}
		}
	}

	.stats {
		display: flex;
		align-items: center;
		gap: 20px;
		&__rating {
			font-size: 50px;
		}
	}

	.modal-card-container {
		padding: 5px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		.modal-card {
			display: flex;
			align-items: center;
			padding: 5px 10px;
			border: 1px solid;
			border-radius: 5px;
			font-size: 16px;
			cursor: pointer;
			background: var(--participant);
			user-select: none;
			&:hover {
				box-shadow: white 0px 0px 0px 1px, black 0px 0px 0px 3px !important;
			}
		}
	}

	.modal-price-input {
		display: flex;
		align-items: center;
		gap: 10px;
		input {
			width: 100%;
			border: 1px solid;
			border-radius: 5px;
			padding: 10px;
			font-size: 16px;
		}
	}

	.input-title {
		width: 100%;
		input {
			border: none;
			width: 100%;
			font-size: 1.125rem;
			line-height: 1.5;
			padding: 3px 5px;
		}
	}


.tilting-card-content {
  --perspective: 500px;
  --rotateX: 0;
  --rotateY: 0;
  --angle: 5deg;

	cursor: pointer;
  position: relative;
  display: grid;
  place-content: center;
  text-align: center;
  box-shadow: var(--shadow);
  transform: perspective(var(--perspective)) rotateX(var(--rotateX))
    rotateY(var(--rotateY));
  transition: transform 300ms ease-out;
}

.tilting-card-content > :where(h1, p) {
  background: white;
  margin: 0;
  padding: 0.5rem;
}

.mouse-position-tracker {
  position: absolute;
  inset: 0;
}

.mouse-position-tracker > div {
  position: absolute;
  width: calc(100% / 3);
  height: calc(100% / 3);
  z-index: 2;
}

.tilting-card-content:has(.mouse-position-tracker > div:nth-child(1):hover) {
  --rotateX: var(--angle);
  --rotateY: calc(var(--angle) * -1);
}

.tilting-card-content:has(.mouse-position-tracker > div:nth-child(2):hover) {
  --rotateX: var(--angle);
}

.tilting-card-content:has(.mouse-position-tracker > div:nth-child(3):hover) {
  --rotateX: var(--angle);
  --rotateY: var(--angle);
}

.tilting-card-content:has(.mouse-position-tracker > div:nth-child(4):hover) {
  --rotateY: calc(var(--angle) * -1);
}

.tilting-card-content:has(.mouse-position-tracker > div:nth-child(6):hover) {
  --rotateY: var(--angle);
}

.tilting-card-content:has(.mouse-position-tracker > div:nth-child(7):hover) {
  --rotateX: calc(var(--angle) * -1);
  --rotateY: calc(var(--angle) * -1);
}

.tilting-card-content:has(.mouse-position-tracker > div:nth-child(8):hover) {
  --rotateX: calc(var(--angle) * -1);
}

.tilting-card-content:has(.mouse-position-tracker > div:nth-child(9):hover) {
  --rotateX: calc(var(--angle) * -1);
  --rotateY: var(--angle);
}

/* 1st, 4th, 7th */
.mouse-position-tracker > div:nth-of-type(3n - 2) {
  left: 0;
}
/* 2nd, 5th, 8th */
.mouse-position-tracker > div:nth-of-type(3n - 1) {
  left: calc(100% / 3);
}
/* 3rd, 6th, 9th */
.mouse-position-tracker > div:nth-of-type(3n) {
  right: 0;
}

/* 1-3 */
.mouse-position-tracker > div:nth-child(n + 1):nth-child(-n + 3) {
  top: 0;
}

/* 4-6 */
.mouse-position-tracker > div:nth-child(n + 4):nth-child(-n + 6) {
  top: calc(100% / 3);
}

/* 7-9 */
.mouse-position-tracker > div:nth-child(n + 7):nth-child(-n + 9) {
  bottom: 0;
}

</style>
