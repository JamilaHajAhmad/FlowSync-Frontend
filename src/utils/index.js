export const scrollIntoSection = (id) => {
    const section = document.getElementById(id);
    if(section) {
        section.scrollIntoView({behavior: "smooth", block: "start"});
    }
}