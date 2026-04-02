extends Control

## Narrative ending overlay — shown when the player wins (10 consecutive heads).

signal ending_acknowledged

@onready var narrative_label: RichTextLabel = $Panel/VBox/NarrativeText
@onready var close_btn: Button = $Panel/VBox/CloseBtn
@onready var title_label: Label = $Panel/VBox/Title

const ENDING_TEXT := """In the year 50,002, beneath skies that had forgotten the sun,
a masked figure stood before the ancient mechanism.

Ten times the coin rose. Ten times it fell with the face of light.

The ritual was complete.

Not victory — completion. The cycle that had ground
through millennia of repetition finally broke its pattern.

The machine went silent. The figure removed its mask
and saw, for the first time, a sky that held no demands.

There would be no more tosses. No more offerings.
The dead gods had received their due,
and in their silence, something like peace descended.

The last toss had been made."""

func _ready() -> void:
	visible = false
	if close_btn:
		close_btn.pressed.connect(_on_close)

func show_ending(_ending_id: String) -> void:
	if narrative_label:
		narrative_label.text = ENDING_TEXT
	if title_label:
		title_label.text = "✦ THE CYCLE ENDS ✦"
	visible = true

func _on_close() -> void:
	ending_acknowledged.emit()
