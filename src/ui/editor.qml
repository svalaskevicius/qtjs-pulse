import QtQuick 2.2
import QtQuick.Controls 1.1
import QtQuick.Layouts 1.1
import QtQuick.Dialogs 1.1

import PulseEditor 1.0

Item {
    id: editor
    anchors.fill: parent
    property alias path: file.path
    Rectangle {
        id: lineColumn
        property int rowHeight: textarea.font.pixelSize + 3
        color: "#f2f2f2"
        width: 50
        height: parent.height
        clip: true
        Rectangle {
            height: parent.height
            anchors.right: parent.right
            width: 1
            color: "#ddd"
        }
        Column {
            y: -textarea.flickableItem.contentY + 4
            width: parent.width
            Repeater {
                model: Math.max(textarea.lineCount + 2,
                                (lineColumn.height / lineColumn.rowHeight))
                delegate: Text {
                    id: text
                    color: "#666"
                    font: textarea.font
                    width: lineColumn.width
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    height: lineColumn.rowHeight
                    renderType: Text.NativeRendering
                    text: index
                }
            }
        }
    }
    TextArea {
        id: textarea
        objectName: "editor"
        anchors.left: lineColumn.right
        width: parent.width - lineColumn.width
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        wrapMode: TextEdit.NoWrap
        frameVisible: false
        text: file.contents
    }
    Highlighter {
        id: highlighter
        textarea: textarea
    }
    EditorFile {
        id: file
    }
}
