/* Mapping Script for Novation Twitch */

function NovationTwitch() {}

/* Globals */
NovationTwitch.timer = { };
NovationTwitch.touchstripLEDMode = { }; /* Indexed by Deck (starts with 0). Values 0: swipe 1: absolute track position */

NovationTwitch.led_brightness = 0x7F;
NovationTwitch.led_blink_time = 200;

/* Color LED Presets */
const NovationTwitch.led_colors = { "smallbtn":0x15, "red":0x16, "amber":0x4F, "green":0x7F };
const NovationTwitch.touchstrip_mode = { };

NovationTwitch.init = function(id) {

	NovationTwitch.enableAdvancedMode();

	/* For Mixer Volume LEDs */
	/* engine.connectControl("[Channel1]", "VuMeter", "NovationTwitch.volumeLEDs");
	engine.connectControl("[Channel2]", "VuMeter", "NovationTwitch.volumeLEDs"); */

	/* Initialize to Swipe LED Mode */
	NovationTwitch.touchstripLEDMode[0] = 0;
	NovationTwitch.touchstripLEDMode[1] = 0;

	/* Turn On Touchstrip LEDs (scaffolding, should be smarter) */
	midi.sendShortMsg(0xB7, 0x16, 0x13);
	midi.sendShortMsg(0xB8, 0x16, 0x13);

	NovationTwitch.startLEDBlink(
	/*	engine.connectControl("[Channel2]","beat_active","firstmix.Stutter2Beat"); */


	/* For Touchstrip Track Position LEDs */
	/* engine.connectControl("[Channel1]", "playposition", "NovationTwitch.touchstripTrackPositionLEDs"); /*
	/* engine.connectControl("[Channel2]", "playposition", "NovationTwitch.touchstripTrackPositionLEDs"); */

}

NovationTwitch.enableAdvancedMode = function() {
	print("Entering Advanced Mode!");
	midi.sendShortMsg(0xB7, 0x00, 0x6F);
}

NovationTwitch.allLEDs = function(state) {

	switch(state) {
		case "on":
			print("Initializing Novation Twitch... LEDs ON!");
			midi.sendShortMsg(0xB7, 0x00, 0x7F);
			break;
		case "off":
			print("Initialized... LEDs OFF!");
			midi.sendShortMsg(0xB7, 0x00, 0x70);
			break;
		default:
			break;
	};

}
NovationTwitch.selectKnob = function(channel, control, value, status, group) {
	if (value == 0x01) {
		engine.setValue("[Playlist]", "SelectNextTrack", 1);
	} else if (value == 0x7F) {
		engine.setValue("[Playlist]", "SelectPrevTrack", 1);
	}
}
NovationTwitch.rateKnob = function(channel, control, value, status, group) {
	var currentValue = engine.getValue(group, "rate");
	print("RateKnob " + group + " currentvalue " + currentValue);
	if(value == 0x01) {
		engine.setValue(group, "rate", ((currentValue + 0.1)));
	} else if (value == 0x7F) {
		engine.setValue(group, "rate", ((currentValue - 0.1)));
	}
}

NovationTwitch.startBlinkLED = function(channel, value, status, ledcolor) {
	//status = status ? ledcolor : 0x00;
	print("Blink " + status);
	//midi.sendShortMsg(channel, value, status);		
}
/* Applies blink timer Returns Global Timer Array Index */
/*
NovationTwitch.startBlinkLED = function(channel, control, ledcolor) {

	for (var i = 0; i<127; i++)
		if(NovationTwitch.timer[i] > 0) 
			continue;

	NovationTwitch.timer[i] = engine.beginTimer(NovationTwitch.led_blink_time, "NovationTwitch.doMidiLEDBlink(\"" + channel + "\", \"" + control + "\", \"" + NovationTwitch.led_colors[ledcolor] + "\")");

	return i;

}

NovationTwitch.doMidiLEDBlink = function(channel, control, ledcolor) {
	midi.sendShortMsg(channel, control, ledcolor);
	
	engine.beginTimer(Math.floor(NovationTwitch.led_blink_time/2), "NovationTwitch.midiLEDOff(\"" + channel + "\", \"" + control + "\")", true);
}

NovationTwitch.midiLEDOff = function(channel, control) {
	midi.sendShortMsg(channel, control, 0x00);
}

NovationTwitch.stopBlinkLED = function(channel, control, index) {
	engine.stopTimer(NovationTwitch.timer[index]);
	NovationTwitch.midiLEDOff(channel, control);
}
*/

NovationTwitch.volumeLEDs = function(value, group, control) {
	
	if(group == "[Channel1]") {
		var channel = 0x97;
	}
	else if(group == "[Channel2]") {
		var channel = 0x98;
	}
	else {
		print("Invalid Arguments");
		return;
	}
	midi.sendShortMsg(channel, 0x5F, (value * 0x7F));
}

NovationTwitch.touchstripTrackPositionLEDs = function(value, group, control) {

	if(group == "[Channel1]") {
		var index = 0;
	} else if (group == "[Channel2]") {
		var index = 1;
	}

	switch(NovationTwitch.touchstripLEDMode[index]) {
		case 0: 
			NovationTwitch.touchstripSwipeLEDs(value, group, control);
			break;
		case 1:
			NovationTwitch.touchstripAbsPositionLEDs(value, group, control);
			break;
	}
}
NovationTwitch.touchstripAbsPositionLEDs = function(value, group, control) {

	if(group == "[Channel1]") {
		channel = 0xB7;
	} else if (group == "[Channel2]"){
		channel = 0xB8;
	} else {
		print("Invalid Arguments");
		return;
	}

	print("Updating Track Position for " + group + "(channel " + channel + ") Raw: " + value + " Computed: " + Math.ceil(value * 0x7F));
	midi.sendShortMsg(channel, 0x16, Math.ceil(value * 0x7F));

}
NovationTwitch.touchstripSwipeLEDs = function(value, group, control) {

	if(group == "[Channel1]") {
		channel = 0xB7;
	} else if (group == "[Channel2]"){
		channel = 0xB8;
	} else {
		print("Invalid Arguments");
		return;
	}

	print("Swipe LED Value = " + Math.ceil((value*10000)%0x7F));
	midi.sendShortMsg(channel, 0x16, Math.ceil((value*10000)%0x7F));

}

NovationTwitch.touchstripAbsTrackPosition = function(channel, control, value, status, group) {
	print("Touchstrip Deck: " + group + " Value: " + value + " Channel: " + channel + " Control: " + control + " Status " + status );
	engine.setValue(group, "playposition", (value / 127));

	/* Turn Off Touch Tracking. (Maybe arg option here) */
	if(group == "[Channel1]") {
		midi.sendShortMsg(0xB7, 0x14, 0x40);
	} else if (group == "[Channel2]") { 
		midi.sendShortMsg(0xB8, 0x14, 0x40);
	} else {
		print("Invalid Arguments");
		return;
	}

	/* Show Swipe Position Mode */
	if (group == "[Channel1]") {
		NovationTwitch.touchstripLEDMode[0] = 0;
	} else if (group == "[Channel2]") {
		NovationTwitch.touchstripLEDMode[1] = 0;
	}

	/* Turn Off DROP LED */
	if(group == "[Channel1]") {
		midi.sendShortMsg(0x97, 0x15, 0x00);
	} else if (group == "[Channel2]") { 
		midi.sendShortMsg(0x98, 0x15, 0x00);
	} else {
		print("Invalid Arguments");
		return;
	}

}

NovationTwitch.touchstripScratchTick = function(channel, control, value, status, group) {
	if(group == "[Channel1]") {
		var deck = 1;
	}
	else if (group == "[Channel2]") {
		var deck = 2;
	}

    var newValue;
    if (value-64 > 0) { /* swipe forward */
	    newValue = value - 128;
    } 
    else { /* swipe backward */
	    newValue = value;
    }

    /* var newValue=(value-64); */
    print("Scratch: New Value " + newValue);
    engine.scratchTick(deck,newValue);
}

NovationTwitch.enableScratchMode = function(channel, control, value, status, group) {

	print("Scratch Mode Enabled on " + group + " (One-Time)");

	/* Turn on Light (blink to improve) */
	if (group == "[Channel1]") { 
		midi.sendShortMsg(0x97, 0x14, NovationTwitch.led_colors["smallbtn"]);
	} else if (group == "[Channel2]") { 
		midi.sendShortMsg(0x98, 0x14, NovationTwitch.led_colors["smallbtn"]);
	} else {
		print("Invalid Arguments");
		return;
	}

	/* Enable 7-Bit Incremental Touchstrip Data Mode */
	if (group == "[Channel1]") { 
		midi.sendShortMsg(0xB7, 0x14, 0x13);
	} else if (group == "[Channel2]") { 
		midi.sendShortMsg(0xB8, 0x14, 0x13);
	} else {
		print("Invalid Arguments");
		return;
	}

}

NovationTwitch.touchstripPress = function(channel, control, value, status, group) {
	if( value == 0) {
		print("Scratch Ending on " + group);
		engine.scratchDisable(group.substring(8,9));
		engine.beginTimer(2000, "NovationTwitch.disableScratch( \"" + group + "\")", true);
		
	} else {
		var alpha = 1.0/8;
		var beta = alpha/32;
		if (group == "[Channel1]") {
			engine.scratchEnable(1, 128, 33+1/3, alpha, beta);
		} else if (group == "[Channel2]") {
			engine.scratchEnable(2, 128, 33+1/3, alpha, beta);
		}
	}
}

NovationTwitch.disableScratch = function(group) {

		/* Temp: Turn Off Touch Tracking and Swipe LED.*/
		if(group == "[Channel1]") {
			midi.sendShortMsg(0xB7, 0x14, 0x40);
			midi.sendShortMsg(0x97, 0x14, 0x00);
		} else if (group == "[Channel2]") { 
			midi.sendShortMsg(0xB8, 0x14, 0x40);
			midi.sendShortMsg(0x98, 0x14, 0x40);
		} else {
			print("Invalid Arguments");
			return;
		}
}
NovationTwitch.enableDropMode = function(channel, control, value, status, group) {

	print("Drop Mode Enabled on " + group + " (One-Time)");
	/* Turn on Light (blink to improve) */
	if (group == "[Channel1]") { 
		midi.sendShortMsg(0x97, 0x15, 0x7F);
	} else if (group == "[Channel2]") { 
		midi.sendShortMsg(0x98, 0x15, 0x7F);
	} else {
		print("Invalid Arguments");
		return;
	}

	/* Show ABS Position Mode */
	if (group == "[Channel1]") {
		NovationTwitch.touchstripLEDMode[0] = 1;
	} else if (group == "[Channel2]") {
		NovationTwitch.touchstripLEDMode[1] = 1;
	}

	/* Enable 7-Bit Abs Position Touchstrip Data Mode */
	if (group == "[Channel1]") { 
		midi.sendShortMsg(0xB7, 0x14, 0x2);
	} else if (group == "[Channel2]") { 
		midi.sendShortMsg(0xB8, 0x14, 0x2);
	} else {
		print("Invalid Arguments");
		return;
	}

}

