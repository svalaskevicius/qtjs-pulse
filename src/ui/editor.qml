import QtQuick 2.2
import QtQuick.Layouts 1.1
import QtQuick.Dialogs 1.1
import QtQuick.Controls 1.2
import QtQuick.Controls.Styles 1.1

import PulseEditor 1.0
/*
Item {
    id: editor

    signal activated()
    signal save()

    anchors.fill: parent
    property alias path: file.path

    Rectangle {
        id: lineColumn
        property int rowHeight: textarea.font.pixelSize + 1
        property int lineBase: Math.floor(textarea.flickableItem.contentY / rowHeight) + 1
        property int lineAmount: lineColumn.height / lineColumn.rowHeight + 1
        color: "#151515"
        width: 40
        height: parent.height
        clip: true
        Rectangle {
            height: parent.height
            anchors.right: parent.right
            width: 1
            color: "#303030"
        }
        Column {
            y: -(textarea.flickableItem.contentY % lineColumn.rowHeight) + 4
            width: parent.width
            Repeater {
                model: Math.min(textarea.lineCount, lineColumn.lineAmount)
                delegate: Text {
                    id: text
                    color: "#505050"
                    font: textarea.font
                    width: lineColumn.width
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    height: lineColumn.rowHeight
                    renderType: Text.NativeRendering
                    text: lineColumn.lineBase + index
                }
            }
        }
    }

    TextArea {
        id: textarea
        anchors.left: lineColumn.right
        width: parent.width - lineColumn.width
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        wrapMode: TextEdit.NoWrap
        frameVisible: false
        text: file.contents
        flickableItem.boundsBehavior: Flickable.DragOverBounds
        onActiveFocusChanged: {
            if (activeFocus) {
                editor.activated()
            }
        }

        style: TextAreaStyle {
            textColor: "#f4bf75"
            selectionColor: "#b0b0b0"
            selectedTextColor: "#151515"
            backgroundColor: "#151515"
            font.family: "Ubuntu Mono"
            font.pointSize: 12
            transientScrollBars: true
        }

        focus: true
    }

    Highlighter {
        id: highlighter
        textarea: textarea
    }

    EditorFile {
        id: file
    }


    onSave: {
        file.contents = textarea.text
        file.save()
    }
}
*/

EditorUI {
    id: editor

    text: "asdasdasd <?php // lala \nlaal lala lala lala asdasdasd lala laal lala lala lala"


//            textColor: "#f4bf75"
//            selectionColor: "#b0b0b0"
//            selectedTextColor: "#151515"
//            backgroundColor: "#151515"
//            font.family: "Ubuntu Mono"
//            font.pointSize: 12
//            transientScrollBars: true

//    signal activated()
//    signal save()

    anchors.fill: parent
//    property alias path: file.path

//    EditorFile {
//        id: file
//    }
}
