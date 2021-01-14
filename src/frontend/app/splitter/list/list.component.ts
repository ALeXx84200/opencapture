import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from "../../../services/local-storage.service";


@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class SplitterListComponent implements OnInit {

    constructor(
        private localeStorageService: LocalStorageService
    ) {
    }

    ngOnInit(): void {
        this.localeStorageService.save('splitter_or_verifier', 'splitter')
    }

}
