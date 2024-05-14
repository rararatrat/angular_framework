import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { chatType } from '@library/library.interface';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

//RT TODO: get users ID when data is live
const MY_ID = 2;

@Component({
  selector: 'eg-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit, AfterViewInit {

  @ViewChild("sendText") sendTextField: ElementRef;

  constructor(@Optional() public config?: DynamicDialogConfig) {
      console.log("data", this.config?.data);
      if(this.config?.data){
        this.chats = this.config?.data?.chats || [];
        this.selectedContact = this.config?.data?.selectedContact;

        const existingChatToUser = this.chats?.find( c => c.value?.id == this.selectedContact?.id);

        const newChatEntry = {label:  `${this.selectedContact?.first_name || ''} ${this.selectedContact?.lastname || ''}`, value: { chatMessages: [], id: 0}};
        if(!existingChatToUser){
          this.chats = [...this.chats, ...[newChatEntry] ];
        }

        setTimeout(() => {
          this.onChat(existingChatToUser || newChatEntry);
        });
      }
    }
  public chatText: string;

  /* @Input()
  chatToUserId: number; */

  public selectedContact: any;

  @Input()
  public chats: any[];

  //@Input()
  public selectedChats: chatType = {chatMessages: [], id: 0};

  @Output()
  public selectedChatsChange: EventEmitter<any>;

  ngOnInit(): void {
  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  public onChat($event: any) {
    this.selectedChats = ($event?.value || {chatMessages: [], id: 0});
    //this.selectedChatsChange.emit(this.selectedChats);

    setTimeout(() => {
      this.sendTextField?.nativeElement?.focus();
    });
  }

  public getBubbleShape(i: number, j: number) {
    let toReturn = 'btm-left';
    if(this.selectedChats?.chatMessages?.length > 1){
      if(j <= this.selectedChats?.chatMessages?.length){
        if(this.selectedChats?.chatMessages[i]?.userId == this.selectedChats?.chatMessages[j]?.userId){
          toReturn = 'eg-m-b-0 eg-p-b-0';
        }
      }
    }
    if(MY_ID == this.selectedChats?.chatMessages?.[i]?.userId){
      toReturn = 'float-right ';

      if((this.selectedChats?.chatMessages[i]?.userId != this.selectedChats?.chatMessages[j]?.userId) || (j == this.selectedChats?.chatMessages?.length)){
        toReturn += 'btm-right';
      }
    }
    return toReturn;
  }

  public onChatKeyDown($event: KeyboardEvent) {
    if($event?.key == "Enter"){
      this.appendChat();
    }
  }

  public appendChat() {
    this.selectedChats.chatMessages = (this.selectedChats.chatMessages || []).concat([{chatId: 100, message: this.chatText, userId: MY_ID, username: 'Randy'}]);
    this.chatText = "";
    //this.selectedChatsChange.emit(this.selectedChats);

    console.log("appendChat", this.selectedChats);
  }

  ngAfterViewInit(): void {}

}
