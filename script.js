document.addEventListener('DOMContentLoaded', () => {
	const sidebar = document.getElementById('sidebar');
	const top = document.getElementById('top');
	const bottom = document.getElementById('bottom');
	const filter = document.getElementById('filter');
	const ui_button = document.getElementById('ui_button');
	const dark_toggle = document.getElementById('dark_toggle');
	const html = document.querySelector('html');
	const moonIcon = dark_toggle.querySelector('.fa-moon');
	const sunIcon = dark_toggle.querySelector('.fa-sun');
	const filterIcon = filter.querySelector('.fa-bars-filter');
	const collapseIcon = filter.querySelector('.fa-left-from-bracket');
	const scrollable = document.querySelector('#cards');
	const fadeOverlayRight = document.querySelector('.fade-overlay.right');
	const fadeOverlayLeft = document.querySelector('.fade-overlay.left');
	const sidebar_hw = document.querySelector('#sidebar .hw');
	const sidebar_sw = document.querySelector('#sidebar .sw');
	const sidebar_languages = document.querySelector('#sidebar .languages');
	const contact = document.querySelector('#contact_button');
	const resume = document.querySelector('#resume_button');
	let color_scheme = '';
	const json_file = 'stuff.json';
	const sserddaLiamE = 'bXlsZXMua2VsbGVyQGdtYWlsLmNvbQ==';
	const rebmuNenohP = 'ODEzLTQ1OS0xNzM5';
	const xiffuSetiSlanoisseforP = 'bXlsZXNrZWxsZXI=';
	const chars = `0x12_3z456e7~89!@r#$-%A^&*(q)`.split('').sort((b, a) => (Math.random() > 0.5 ? 1 : -1));
	tag_animation_delay = 100;

	// TODO: ensure everything is responsive :')

	function setCardInitialState() {
		fetch(json_file)
			.then((response) => response.json())
			.then((data) => {
				// determine quantity in data.positions
				const quantity = data.positions.length;
				// create cards
				for (let i = 0; i < quantity; i++) {
					const card = document.createElement('div');
					card.classList.add('flip-card', 'button');
					card.innerHTML = `
          <div class="card-face card-front">
            <div class="container">
              <h1 class="title is-1 position"></h1>
              <h2 class="subtitle employer"></h2>
            </div>
          </div>
          <div class="card-face card-back">
            <div class="container">
              <h1 class="title name"></h1>
            </div>
          `;
					card.querySelector('.position').textContent = data.positions[i].position;
					card.querySelector('.employer').textContent = data.positions[i].employer;

					card.addEventListener('click', () => {
						// when inactive card is clicked
						if (!card.classList.contains('active')) {
							// if card is (inactive) position
							if (!card.classList.contains('project')) {
								card.classList.add('active');
								card.classList.remove('back');
								card.classList.remove('project');

								sidebar.classList.remove('hidden');
								ui_button.classList.remove('hidden');
								// changeFilterIcon();
								top.classList.add('hidden');
								bottom.classList.remove('hidden');
								fadeOverlayRight.classList.add('top');
								fadeOverlayLeft.classList.add('top');
								reorderCards(card.querySelector('.position').textContent);
								fetchPositionsAndAssignProjects(card.querySelector('.position').textContent);
								identifyPositionSkills(card.querySelector('.position').textContent);
								updateBottomWithPosition(data, card);
								// if card is project (with back facing)
							} else {
								updateBottomWithProject(card.querySelector('.name').textContent);
								document.querySelectorAll('.flip-card').forEach((_card) => {
									_card.classList.remove('current_project');
									_card.querySelector('.card-back').classList.add('card-overlay');
								});
								card.classList.add('current_project');
							}
						} else {
							// when active card is clicked
							document.querySelectorAll('.flip-card').forEach((_card) => {
								_card.classList.remove('current_project');
								_card.querySelector('.card-back').classList.add('card-overlay');
							});
							updateBottomWithPosition(data, card);
							identifyPositionSkills(card.querySelector('.position').textContent);
							scrollActivePositionCardIntoView();
						}
						checkScrolls();
					});
					document.getElementById('cards').appendChild(card);
				}
			});
	}

	function identifyPositionSkills(position) {
		fetch(json_file)
			.then((response) => response.json())
			.then((data) => {
				// create flattened list of all language, hw, and sw of projects in active position from stuff.json
				const position_data = data.positions.find((p) => p.position === position);
				// console.log(position_data);
				// create flattened list of all languages, hw, and sw from projects found in position_data
				const allTags = position_data.projects
					.reduce((acc, project) => {
						return [...acc, ...project.languages, ...project.hw, ...project.sw];
					}, [])
					.filter((tag, index, self) => self.indexOf(tag) === index);
				// console.log(allTags);
				const allSkills = position_data.role_hw.concat(
					position_data.role_sw,
					position_data.role_languages,
					position_data.achievement_hw,
					position_data.achievement_sw,
					position_data.achievement_languages,
					allTags
				);
				// console.log(allSkills);

				// add class.has-background-primary-soft has-text-primary-soft-invert to all tags in sidebar
				sidebar_languages.querySelectorAll('.tag').forEach((tag) => {
					if (allSkills.includes(tag.innerText)) {
						tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
					}
				});
				sidebar_hw.querySelectorAll('.tag').forEach((tag) => {
					if (allSkills.includes(tag.innerText)) {
						tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
					}
				});
				sidebar_sw.querySelectorAll('.tag').forEach((tag) => {
					if (allSkills.includes(tag.innerText)) {
						tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
					}
				});
			});
	}
	// updates #bottom with position information
	function updateBottomWithPosition(data, card) {
		bottom.innerHTML = `
                  <div class="container scrollable">
					<div class="columns">
						<h2 class="column is-narrow">Roles</h2>
							<div class="column">
							<div class="tags role_skills"></div>
						</div>
					</div>
                    <ul class="roles"></ul>
                    <div class="block"></div>
					<div class="columns">
						<h2 class="column is-narrow">Achievements</h2>
							<div class="column">
							<div class="tags achievement_skills"></div>
						</div>
					</div>
					<ul class="achievements"></ul>
                  </div>
				  <div class="gradient gradient-top"></div>
  				  <div class="gradient gradient-bottom"></div>
                `;
		data.positions.forEach((position) => {
			if (position.position === card.querySelector('.position').textContent) {
				// flatten "position.languages", "position.hw", and "position.sw" into one list and add to .skills
				const role_skills = [...position.role_languages, ...position.role_hw, ...position.role_sw];
				console.log(role_skills);
				role_skills.forEach((skill, index) => {
					const tag = document.createElement('span');
					tag.classList.add('tag');
					tag.textContent = skill;
					// bottom.querySelector('.role_skills').appendChild(tag);
					setTimeout(() => {
						bottom.querySelector('.role_skills').appendChild(tag);
					}, index * tag_animation_delay); // 100ms delay between each tag
				});
				const achievement_skills = [
					...position.achievement_languages,
					...position.achievement_hw,
					...position.achievement_sw,
				];
				// console.log(achievement_skills);
				achievement_skills.forEach((skill, index) => {
					const tag = document.createElement('span');
					tag.classList.add('tag');
					tag.textContent = skill;
					setTimeout(() => {
						bottom.querySelector('.achievement_skills').appendChild(tag);
					}, index * tag_animation_delay); // 100ms delay between each tag
				});
				// add roles from current position to .roles
				position.roles.forEach((role, index) => {
					const li = document.createElement('li');
					li.textContent = role;
					// setTimeout(() => {
					bottom.querySelector('.roles').appendChild(li);
					// }, index * tag_animation_delay); // 100ms delay between each tag
				});
				// add achievements from current position to .achievements
				position.achievements.forEach((achievement, index) => {
					const li = document.createElement('li');
					li.textContent = achievement;
					// setTimeout(() => {
					bottom.querySelector('.achievements').appendChild(li);
					// }, index * tag_animation_delay); // 100ms delay between each tag
				});
			}
		});

		const nonActiveCards = document.querySelectorAll('.flip-card:not(.active)');
		nonActiveCards.forEach((card, index) => {
			card.querySelector('.card-back').classList.add('card-overlay');
		});
	}
	// updates #bottom with project information
	function updateBottomWithProject(projectTitle) {
		// update #bottom div with project description from json
		fetch(json_file)
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				// iterate through data.positions and create a list of all position.projects
				const projectsList = data.positions.map((position) => position.projects).flat();

				if (projectsList) {
					const project_data = projectsList.find((project_data) => project_data.name === projectTitle);
					if (project_data) {
						// const bottom = document.getElementById('bottom');

						// add html to bottom
						bottom.innerHTML = `
            <div class="container scrollable">
			<div class="columns">
              <h2 class="column is-narrow name"></h2>
				<div class="column">
					<div class="tags project_skills"></div>
				</div>
              </div>
              <div class="description"></div>
            </div>
            `;

						// add title
						var projectName = bottom.querySelector('.name');
						if (projectName) {
							projectName.textContent = project_data.name;
						}
						// add description
						var projectdescription = bottom.querySelector('.description');
						if (projectdescription) {
							projectdescription.innerHTML = project_data.description;
						}
						// find card in cards containing .title matching projectTitle
						const activeCard = document.querySelector(`.current_project .card-back`);
						// remove card-overlay class from card
						activeCard.classList.remove('card-overlay');
						// add tags
						var projectSkills = bottom.querySelector('.project_skills');
						projectSkills.innerHTML = '';
						// create a list combining project_data.languages, project_data.sw, and project_data.hw
						if (project_data.sw) {
							project_data.sw.forEach((software, index) => {
								const technologyTag = document.createElement('span');
								technologyTag.className = 'tag';
								technologyTag.textContent = software;
								// projectSkills.appendChild(technologyTag);
								setTimeout(() => {
									projectSkills.appendChild(technologyTag);
								}, index * tag_animation_delay); // 100ms delay between each tag
							});
						}
						if (project_data.hw) {
							project_data.hw.forEach((hardware, index) => {
								const technologyTag = document.createElement('span');
								technologyTag.className = 'tag';
								technologyTag.textContent = hardware;
								// projectSkills.appendChild(technologyTag);
								setTimeout(() => {
									projectSkills.appendChild(technologyTag);
								}, index * tag_animation_delay); // 100ms delay between each tag
							});
						}
						if (project_data.languages) {
							project_data.languages.forEach((language, index) => {
								const technologyTag = document.createElement('span');
								technologyTag.className = 'tag';
								technologyTag.textContent = language;

								// projectSkills.appendChild(technologyTag);
								setTimeout(() => {
									projectSkills.appendChild(technologyTag);
								}, index * tag_animation_delay); // 100ms delay between each tag
							});
						}
						identifyProjectSkills(project_data);
					}
					scrollCurrentProjectCardIntoView();
				}
			})
			.catch((error) => {
				console.error('There has been a problem with your fetch operation:', error);
			});
	}
	// determines wether active system color scheme is light or dark
	function checkSystemColorScheme(moonIcon, sunIcon, color_scheme) {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme == 'light') {
			console.log('stored theme is light');
			html.setAttribute('data-theme', 'light');
			moonIcon.classList.remove('active');
			sunIcon.classList.add('active');
			color_scheme = 'light';
		} else if (storedTheme == 'dark') {
			console.log('stored theme is dark');
			html.setAttribute('data-theme', 'dark');
			moonIcon.classList.add('active');
			sunIcon.classList.remove('active');
			color_scheme = 'dark';
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			console.log('The system is in dark mode');
			moonIcon.classList.add('active');
			sunIcon.classList.remove('active');
			color_scheme = 'dark';
		} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
			console.log('The system is in light mode');
			moonIcon.classList.remove('active');
			sunIcon.classList.add('active');
			color_scheme = 'light';
		}
		return color_scheme;
	}
	// makes sidebar hide/unhide with hamburger
	filter.addEventListener('click', () => {
		sidebar.classList.toggle('hidden');
		// changeFilterIcon();
		checkScrolls();
	});

	function decodeText(base64EncodedPhrase, mode, elementID, hrefElementID) {
		const getRandomChar = (c) => {
			const n = chars.length;
			const x = chars[Math.round(Math.random() * n * 10) % n];
			return x === c ? getRandomChar(c) : x;
		};

		const getRandomName = (name) => {
			let str = '';
			for (let i = 0; i < name.length; ++i) {
				const c = name.charAt(i);
				str = str + (c === ' ' ? ' ' : getRandomChar(c));
			}
			return str;
		};

		const h = document.getElementById(elementID);
		const a = document.getElementById(hrefElementID);

		let currentIndex = 0;
		let intervalId = null;

		const handleDecrypt = (originalName) => {
			intervalId = setInterval(() => {
				if (currentIndex > originalName.length) {
					clearInterval(intervalId);
					intervalId = null;
					return;
				}
				const c = originalName.charAt(currentIndex);
				const n = currentIndex + 1;
				const decoded = originalName.slice(0, n);
				const encoded = getRandomName(originalName.slice(n));
				const completeText = decoded + encoded;
				h.innerText = completeText;
				if (mode === 'e') a.href = decodeBase64('bWFpbHRvOg==') + decoded;
				else if (mode === 'p') a.href = decodeBase64('dGVsOisx') + decoded.replace(/-/g, '');
				else if (mode === 'l') a.href = decodeBase64('aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luLw==') + decoded;
				else if (mode === 'g') a.href = decodeBase64('aHR0cHM6Ly93d3cuZ2l0aHViLmNvbS8=') + decoded;
				currentIndex++;
			}, 60);
		};

		const decodeBase64 = (base64) => {
			return atob(base64);
		};

		// Start decrypting the single phrase
		const originalName = decodeBase64(base64EncodedPhrase);
		h.innerText = getRandomName(originalName);
		if (mode === 'e') a.href = decodeBase64('bWFpbHRvOg==');
		else if (mode === 'p') a.href = decodeBase64('dGVsOisx');
		else if (mode === 'l') a.href = decodeBase64('aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luLw==');
		else if (mode === 'g') a.href = decodeBase64('aHR0cHM6Ly93d3cuZ2l0aHViLmNvbS8=');
		handleDecrypt(originalName);
	}

	function emptyContactInfo(elementID, HrefElementID) {
		document.getElementById(elementID).innerText = '';
		document.getElementById(HrefElementID).href = '';
	}

	contact.addEventListener('click', () => {
		const contact_dropdown = document.getElementById('contact_dropdown');
		contact_dropdown.classList.toggle('is-active');
		if (contact_dropdown.classList.contains('is-active')) {
			decodeText(sserddaLiamE, 'e', 'sserddaLiamE', 'ferHsserddaLiamE');
			decodeText(rebmuNenohP, 'p', 'rebmuNenohP', 'ferHrebmuNenohP');
			decodeText(xiffuSetiSlanoisseforP, 'l', 'nIdekniL', 'ferHnIdekniL');
			decodeText(xiffuSetiSlanoisseforP, 'g', 'buHtiG', 'ferHbuHtiG');
		} else {
			emptyContactInfo('sserddaLiamE', 'ferHsserddaLiamE');
			emptyContactInfo('rebmuNenohP', 'ferHrebmuNenohP');
			emptyContactInfo('nIdekniL', 'ferHnIdekniL');
			emptyContactInfo('buHtiG', 'ferHbuHtiG');
		}
	});

	resume.addEventListener('click', () => {
		const resume_dropdown = document.getElementById('resume_dropdown');
		resume_dropdown.classList.toggle('is-active');
	});

	// makes ui_button have same effect as clicking active card
	ui_button.addEventListener('click', () => {
		document.querySelectorAll('.flip-card').forEach((_card) => {
			_card.classList.remove('active');
			_card.classList.remove('back');
			_card.classList.remove('project');
			_card.classList.remove('current_project');
		});

		sidebar.classList.add('hidden');
		ui_button.classList.add('hidden');
		// changeFilterIcon();
		top.classList.remove('hidden');
		bottom.classList.add('hidden');
		fadeOverlayRight.classList.remove('top');
		fadeOverlayLeft.classList.remove('top');
		resetCardOrder();
		resetSkills();
		checkScrolls();
	});
	// toggles light/dark mode
	dark_toggle.addEventListener('click', () => {
		if (color_scheme === 'dark') {
			html.setAttribute('data-theme', 'light');
			color_scheme = 'light';
		} else {
			html.setAttribute('data-theme', 'dark');
			color_scheme = 'dark';
		}
		localStorage.setItem('theme', color_scheme);
		moonIcon.classList.toggle('active');
		sunIcon.classList.toggle('active');
	});

	document.getElementById('bg_toggle').addEventListener('click', () => {
		// toggle display (from none to block) of bg_toggle
		if (document.getElementById('animated_bg').style.display == 'none') {
			document.getElementById('animated_bg').style.display = 'block';
			document.getElementById('bg_toggle').classList.add('is-primary');
		} else {
			document.getElementById('animated_bg').style.display = 'none';
			document.getElementById('bg_toggle').classList.remove('is-primary');
		}
	});

	function populateSidebar() {
		fetch('stuff.json')
			.then((response) => response.json())
			.then((data) => {
				// get languages from all projects in data.positions and add to #sidebar .languages
				const languages = data.positions.flatMap((position) =>
					position.projects.flatMap((project) => project.languages)
				);
				const uniqueLanguages = [...new Set(languages)];
				uniqueLanguages.forEach((language) => {
					if (language !== undefined) {
						const languageTag = document.createElement('span');
						languageTag.className = 'tag';
						languageTag.textContent = language;
						sidebar_languages.appendChild(languageTag);
					}
				});
				// get hw from all projects in data.positions and add to #sidebar .hw
				const hardware = data.positions.flatMap((position) => position.projects.flatMap((project) => project.hw));
				const uniqueHardware = [...new Set(hardware)];
				uniqueHardware.forEach((hardware) => {
					// if hardware is not undefined
					if (hardware !== undefined) {
						const hardwareTag = document.createElement('span');
						hardwareTag.className = 'tag';
						hardwareTag.textContent = hardware;
						sidebar_hw.appendChild(hardwareTag);
					}
				});
				// get sw from all projects in data.positions and add to #sidebar .sw
				const software = data.positions.flatMap((position) => position.projects.flatMap((project) => project.sw));
				const uniqueSoftware = [...new Set(software)];
				uniqueSoftware.forEach((software) => {
					if (software !== undefined) {
						const softwareTag = document.createElement('span');
						softwareTag.className = 'tag';
						softwareTag.textContent = software;
						sidebar_sw.appendChild(softwareTag);
					}
				});
			});
	}
	// gets projects from active position
	function fetchPositionsAndAssignProjects(positionTitle) {
		fetch('stuff.json')
			.then((response) => response.json())
			.then((data) => {
				const positions = data.positions;
				const position = positions.find((p) => p.position === positionTitle);
				if (position && position.projects) {
					distributeProjects(position.projects);
				}
			})
			.catch((error) => console.error('Fetch error:', error));
	}
	// populates inactive cards with projects from active position
	function distributeProjects(projects) {
		const nonActiveCards = document.querySelectorAll('.flip-card:not(.active)');
		nonActiveCards.forEach((card, index) => {
			if (projects[index]) {
				// Check if there is a corresponding project
				const project = projects[index];
				var projectName = card.querySelector('.name');
				if (projectName) {
					projectName.textContent = project.name;
				}
				var projectsummary = card.querySelector('.summary');
				if (projectsummary) {
					projectsummary.textContent = project.summary;
				}
				// if there's a project.bg, assign it to the background image css of the card
				if (project.bg) {
					card.querySelector('.card-back').style.backgroundImage = `url(${project.bg})`;
					card.querySelector('.card-back').classList.add('card-overlay');
				}
				var projectTechnologies = card.querySelector('.languages');
				if (projectTechnologies) {
					projectTechnologies.innerHTML = '';
					project.languages.forEach((technology) => {
						const technologyTag = document.createElement('span');
						technologyTag.className = 'tag';
						technologyTag.textContent = technology;
						projectTechnologies.appendChild(technologyTag);
					});
				}
				card.classList.add('back');
				card.classList.add('project');
			}
		});
	}
	// checks scroll position to control fade overlay
	function checkRightScroll() {
		if (Math.round(scrollable.scrollWidth - scrollable.scrollLeft) === scrollable.clientWidth) {
			fadeOverlayRight.classList.add('hidden');
		} else {
			fadeOverlayRight.classList.remove('hidden');
		}
	}
	// checks scroll position to control fade overlay for left side
	function checkLeftScroll() {
		if (scrollable.scrollLeft === 0) {
			fadeOverlayLeft.classList.add('hidden');
		} else {
			fadeOverlayLeft.classList.remove('hidden');
		}
	}

	function checkScrolls() {
		checkRightScroll();
		checkLeftScroll();
	}
	// updates filter icon status based off of statusbar visibility
	function changeFilterIcon() {
		if (sidebar.classList.contains('hidden')) {
			filterIcon.classList.add('active');
			collapseIcon.classList.remove('active');
		} else {
			filterIcon.classList.remove('active');
			collapseIcon.classList.add('active');
		}
	}
	// debounces scroll position for improved performance
	function debounce(func, wait, immediate) {
		let timeout;
		return function () {
			const context = this,
				args = arguments;
			const later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}
	// debounces scroll position for improved performance
	function reorderCards(firstCard) {
		const cards = document.getElementById('cards');
		// Find the .flip-card within cards that has a child element with class .position where textContent == firstCard
		const childToMove = Array.from(cards.children).find(
			(card) => card.querySelector('.position').textContent.trim() === firstCard
		);
		if (childToMove) {
			// Remove the element from its current position
			cards.removeChild(childToMove);
			// Append the element to the new position (at the beginning)
			cards.insertBefore(childToMove, cards.firstChild);
		}
	}
	// resets cards order to initial JSON order
	async function resetCardOrder() {
		try {
			// Fetch JSON data
			const response = await fetch('stuff.json');
			const data = await response.json();
			// Get cards container
			const cards = document.getElementById('cards');
			// Map positions to card elements
			data.positions.forEach((pos, index) => {
				// Find the corresponding card element
				const card = Array.from(cards.children).find(
					(card) => card.querySelector('.position').textContent.trim() === pos.position
				);
				if (card) {
					// Remove the card from its current position
					cards.removeChild(card);
					// Insert the card at the correct position according to JSON order
					cards.insertBefore(card, cards.children[index]);
				}
			});
		} catch (error) {
			console.error('Error fetching or processing JSON:', error);
		}
	}

	function scrollCurrentProjectCardIntoView() {
		const activeCard = scrollable.querySelector('.current_project');

		if (activeCard) {
			const activeCardRect = activeCard.getBoundingClientRect();
			const cardsRect = scrollable.getBoundingClientRect();

			// Check if the active div is partially or fully outside the viewport within the parent (considering horizontal scroll)
			const isPartiallyVisible = activeCardRect.left < cardsRect.left || activeCardRect.right > cardsRect.right;

			if (isPartiallyVisible) {
				// Calculate the scroll position needed to bring the active div fully into view
				const scrollLeft = activeCardRect.left - cardsRect.left;
				scrollable.scrollLeft = scrollLeft;
			}
		}
	}

	function scrollActivePositionCardIntoView() {
		const activeCard = scrollable.querySelector('.active');
		if (activeCard) {
			const activeCardRect = activeCard.getBoundingClientRect();
			const cardsRect = scrollable.getBoundingClientRect();
			// Check if the active div is partially or fully outside the viewport within the parent (considering horizontal scroll)
			const isPartiallyVisible = activeCardRect.left < cardsRect.left || activeCardRect.right > cardsRect.right;

			if (isPartiallyVisible) {
				// Calculate the scroll position needed to bring the active div fully into view
				const scrollLeft = activeCardRect.left - cardsRect.left;
				scrollable.scrollLeft = scrollLeft;
			}
		}
	}

	function identifyProjectSkills(project_data) {
		// reset tags from primary to light
		sidebar_languages.querySelectorAll('.is-primary').forEach((tag) => {
			tag.classList.remove('is-primary');
			tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
		});

		const allTags = [project_data.hw, project_data.sw, project_data.languages].flat();
		sidebar_languages.querySelectorAll('.tag').forEach((tag) => {
			if (allTags.includes(tag.innerText)) {
				tag.classList.add('is-primary');
				tag.classList.remove('has-background-primary-soft', 'has-text-primary-soft-invert');
			}
		});
		sidebar_hw.querySelectorAll('.tag').forEach((tag) => {
			if (allTags.includes(tag.innerText)) {
				tag.classList.add('is-primary');
				tag.classList.remove('has-background-primary-soft', 'has-text-primary-soft-invert');
			}
		});
		sidebar_sw.querySelectorAll('.tag').forEach((tag) => {
			if (allTags.includes(tag.innerText)) {
				tag.classList.add('is-primary');
				tag.classList.remove('has-background-primary-soft', 'has-text-primary-soft-invert');
			}
		});
	}

	function resetSkills() {
		sidebar_languages.querySelectorAll('.tag').forEach((tag) => {
			tag.classList.remove('is-primary', 'has-background-primary-soft', 'has-text-primary-soft-invert');
		});
		sidebar_hw.querySelectorAll('.tag').forEach((tag) => {
			tag.classList.remove('is-primary', 'has-background-primary-soft', 'has-text-primary-soft-invert');
		});
		sidebar_sw.querySelectorAll('.tag').forEach((tag) => {
			tag.classList.remove('is-primary', 'has-background-primary-soft', 'has-text-primary-soft-invert');
		});
	}

	// runonce stuff
	color_scheme = checkSystemColorScheme(moonIcon, sunIcon, color_scheme);
	scrollable.addEventListener('scroll', checkScrolls);
	checkScrolls();
	setCardInitialState();
	populateSidebar();
});
