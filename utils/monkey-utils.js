import moment from 'moment'

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

export const defineTimeByToday = (time) => {
	let result;
	const oneDay = 86400000;
	
	let diffTime = moment().diff(moment(time));
	if(diffTime <= oneDay) {
		result = moment(time).format('HH:mm A');
	}else if(diffTime < oneDay*2) {
		result = 'yesterday';
	}else if(diffTime < oneDay*7) {
		result = moment(time).format('dddd');
	}else{
		result = moment(time).format('DD/MM/YYYY');
	}
	
	return result;
}

export const getExtention = (filename) => {
    let arr = filename.split('.');
    let extension = arr[arr.length-1];
    return extension;
}