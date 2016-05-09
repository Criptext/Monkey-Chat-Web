
export const isConversationGroup = (conversationId) => {
	let result = false;
    if(conversationId.indexOf("G:") >= 0){
        result = true;
    }
    return result;
}

export const defineTime = (time) => {
    let _d = new Date(+time);
    let nhour = _d.getHours(),
        nmin = _d.getMinutes(),
        ap;
    if (nhour == 0) {
        ap = " AM";nhour = 12;
    } else if (nhour < 12) {
        ap = " AM";
    } else if (nhour == 12) {
        ap = " PM";
    } else if (nhour > 12) {
		ap = " PM";nhour -= 12;
    }
    let result = ("0" + nhour).slice(-2) + ":" + ("0" + nmin).slice(-2) + ap + "";
    return result;
}