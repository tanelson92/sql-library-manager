window.onload = () => {
    let searchBar = document.querySelector('#search-bar');
    let searchBtn = document.querySelector('#search-btn');

    const search = (query) => {
        if (query.length > 0) {
            window.location.href = `/search/${searchBar.value}`;
        }
    }; 
    
    searchBtn.addEventListener('click', e => {
        //Submit on button "click".
        search(searchBar.value);
    });
    searchBar.addEventListener('keyup', e => {
        //Submit on "Enter" key press. 
        if (e.keyCode === 13) {
            search(searchBar.value);
        }
    });
};