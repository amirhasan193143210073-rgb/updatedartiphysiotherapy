const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});




// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav ');
const sidebar = document.getElementById('sidebar');
const left_arrow = document.querySelector('.bx.bx-left-arrow-alt')
const right_arrow = document.querySelector('.bx.bx-right-arrow-alt')

// menuBar.addEventListener('click', function () {
// 	sidebar.classList.toggle('hide');
   
// })
left_arrow.addEventListener('click', function () {
    sidebar.classList.toggle('hide');
     left_arrow.style.display='none'
    right_arrow.style.display='block'
})
right_arrow.addEventListener('click', function () {
    left_arrow.style.display='block'
   right_arrow.style.display='none'
   sidebar.classList.toggle('hide');
})