<script lang="ts">
	import ResultColorBox from '$lib/ResultColorBox.svelte';
	import Result from '$lib/Result.svelte';
	import { getRgbScore, hexToRgb } from '$lib/helpers/colorHelper';
	import type { PageData } from './$types';
	import type { rgbColor } from '$lib/types/rgbColor';
	import { makeid } from '$lib/helpers/seedHelper';
	import { goto } from '$app/navigation';

	export let data: PageData;
  	
	const actual: rgbColor = hexToRgb("#"+data.actual);
	const guess: rgbColor = hexToRgb("#"+data.guess);

	function randomSeedReload() {
		let seed = makeid(8);
		goto(`/game/${seed}`)
	}
	
	let score = Math.round(getRgbScore(actual, guess))
</script>

<main>
	<div class="results">
		<ResultColorBox color={"#"+data.actual} />
		<Result {actual} {guess} />
		<ResultColorBox color={"#"+data.guess} />
	</div>
	<div class="scoreContainer">
		<p>Score: {score}%</p>
		<button class="playAgain" on:click={randomSeedReload}>Play again</button>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		padding: 2rem;
	}
	.results {
		display: flex;
		flex-direction: column;
	}
	.scoreContainer {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.playAgain {
		margin: 0 auto 0 auto;
		padding: 0 1rem 0 1rem;
		line-height: 3rem;
		height: 3rem;
		border-radius: 1rem;
		border: 0.2rem solid black;
		background-color: rgba(255, 255, 255, 0.5);
		font-size: 2rem;
		box-shadow: 0.5rem 0.5rem 0rem rgba(0, 0, 0, 0.5);
		transition-duration: 0.1s;
		display: flex;
    	justify-content: center;
    	align-items: center;
	}
	.playAgain:hover {
		background-color: rgba(255, 255, 255, 0.8);
		transform: translate(-0.1rem, -0.1rem);
		box-shadow: 0.6rem 0.6rem 0rem rgba(0, 0, 0, 0.5);
	}
	p {
		font-size: 2.5rem;
		color: white;
		text-align: center;
	}

	@media screen and (min-width: 768px) {
		main {
			display: grid;
			padding: 2rem;
			grid-template-columns: 1fr;
			grid-template-rows: 2fr 1fr 1fr;
		}
		.results {
			display: grid;
			height: 20rem;
			grid-template-columns: 1fr 2fr 1fr;
			padding: 1rem;
			grid-template-rows: 1fr;
			place-items: center;
		}
		p {
			font-size: 3rem;
		}
	}
</style>
