import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  IterableDiffers,
  Output,
  Renderer2,
  ViewChild,
  Directive,
} from '@angular/core';
import {ControlValueAccessor, NgControl, Validators} from '@angular/forms';

@Directive({
  selector: 'aui-slider-min-label, [auiSliderMinLabel]',
})
export class AuiSliderMinDirective {}
@Directive({
  selector: 'aui-slider-max-label, [auiSliderMaxLabel]',
})
export class AuiSliderMaxDirective {}


const noop = () => {};

// credits to: https://github.com/lokeshkandala/ngx-rangeslider
@Component({
  selector: 'aui-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
  // providers: [
  //   {
  //     provide: NG_VALUE_ACCESSOR,
  //     useExisting: forwardRef(() => AuiSliderComponent),
  //     multi: true
  //   },
  //   { provide: NG_VALIDATORS, useExisting: forwardRef(() => AuiSliderComponent), multi: true }
  // ]
})
export class AuiSliderComponent {
  @HostBinding('attr.tabindex') @Input() tabindex = 0;

  @ViewChild('bar', { static: false }) bar!: ElementRef;
  @ViewChild('minSlider') minSlider!: ElementRef;
  @ViewChild('maxSlider') maxSlider!: ElementRef;
  @ViewChild('sliderHighlight') sliderHighlight!: ElementRef;

  @Output() rangeChange: EventEmitter<number[] | number> = new EventEmitter<number[] | number>();

  @Input() min = 0;
  @Input() max = 100;
  @Input() label!: string;
  @Input() sliderClass!: string;
  @Input() highlightClass!: string;
  @Input() barClass!: string;
  @Input() minSpread!: number;
  @Input() maxSpread!: number;
  @Input() step!: number;
  @Input() minLimit!: number;
  @Input() maxLimit!: number;
  @Input() showMinMaxLabels = false;
  @Input() showMinMaxTemplates = false;
  @Input() decimalPlaces = false;
  @Input() rangeSlider = false;
  @Input() showTooltip = false;

  isDisabled!: boolean;
  isRequired!: boolean;
  minLimitWidth!: number;
  maxLimitWidth!: number;
  minSliderLeft!: number;
  maxSliderLeft!: number;
  initialMinMouseX!: number;
  minChange!: number;
  maxSliderInitialLeft!: number;
  minSliderInitialLeft!: number;
  initialMaxMouseX!: number;
  sliderWidth!: number;
  barWidth!: number;
  rangeDiff!: number;
  rangeInPixels!: number;
  highlightLeft!: number;
  highlightWidth!: number;
  sliderHeight!: number;
  toolTipTop!: number;
  combineToolTipLeft!: number;
  combineToolTipWidth!: number;
  minToolTipWidth!: number | undefined;
  range!: number[];
  rangeCache!: number[];
  toolTip = true;
  minSelected = false;
  maxSelected = false;
  combineToolTip = false;
  minSliderTouched = false;

  private iterableDiffer!: any;
  private valToPixelFactor!: number;
  private minSliderClicked = false;
  private maxSliderClicked = false;

  private onTouchedCallback: (_: any) => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  constructor(private elRef: ElementRef, private renderer: Renderer2,
    private iterableDiffers: IterableDiffers, public ngControl: NgControl) {
    //@ts-ignore
    this.iterableDiffer = this.iterableDiffers.find([]).create(null);
    this.ngControl.valueAccessor = this;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.range) {
      this.getWidth();
    }
  }

  @HostListener('focusout', ['$event'])
  sliderFocusout(event: any) {
    this.minSliderClicked = this.maxSliderClicked = false;
  }

  @HostListener('focusin', ['$event'])
  sliderFocusin(event: any) {
    if (this.rangeSlider) {
      this.minSliderClicked = true;
      this.maxSliderClicked = false;
    } else {
      this.minSliderClicked = false;
      this.maxSliderClicked = true;
    }
  }
  @HostListener('touchmove', ['$event'])
  touchMove(event: TouchEvent) {
    event.preventDefault();
    const evt = event.changedTouches[0];
    this.mouseMove(evt);
  }

  @HostListener('touchend', ['$event'])
  touchend(event: TouchEvent) {
    this.minSelected = false;
    this.maxSelected = false;
  }

  @HostListener('window:mouseup', ['$event'])
  mouseUp(event: any) {
    this.minSelected = false;
    this.maxSelected = false;
  }

  @HostListener('window:mousemove', ['$event'])
  mouseMove(event: MouseEvent | Touch) {
    if (this.minSelected || this.maxSelected) {
      if (event instanceof MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (this.minSelected) {
        this.minChange = event.clientX - this.initialMinMouseX;
        const left = this.minSliderInitialLeft + this.minChange;
        if (this.rangeSlider) {
          this.setZipperBorder(left, 'min', this.minSlider.nativeElement.offsetWidth);
        }
        const value = this.pixToVal(this.min, left);
        if (!this.pIsSpreadCorrect(value, this.range[1])) {
          return;
        }
        if (value <= this.range[1]) {
          if (value <= this.min && !this.minLimit) {
            this.minSliderLeft = 0;
            this.range[0] = this.min;
          } else {
            const finalVal = this.minLimit ?
              this.stepper(value) >= this.minLimit ? this.stepper(value) : this.minLimit : this.stepper(value);
            this.range[0] = finalVal <= this.range[1] ? finalVal : this.range[1];
            this.minSliderLeft = this.valToPixel(this.range[0]);
          }
        }
      }
      else if (this.maxSelected) {
        const maxChange = event.clientX - this.initialMaxMouseX;
        const left = this.maxSliderInitialLeft + maxChange;
        if (this.rangeSlider) {
          this.setZipperBorder(left, 'max', this.minSlider.nativeElement.offsetWidth);
        }
        const value = this.pixToVal(this.min, left);
        if (!this.pIsSpreadCorrect(this.range[0], value)) {
          return;
        }
        if (value >= this.range[0]) {
          if (value >= this.max && !this.maxLimit) {
            this.maxSliderLeft = this.rangeInPixels;
            this.range[1] = this.max;
          } else {
            const final = this.maxLimit ? this.stepper(value) <= this.maxLimit ? this.stepper(value) : this.maxLimit : this.stepper(value);
            this.range[1] = final > this.range[0] ? final <= this.max ? final : this.max : this.range[0];
            this.maxSliderLeft = this.valToPixel(this.range[1]);
          }
        } else {
          this.range[1] = this.range[0];
        }
      }
      this.highlightDimensions();
    }
  }

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const step = this.step ? this.step : 1;
    if ((this.minSliderClicked || this.maxSliderClicked) && !this.isDisabled) {
      if (this.minSliderClicked) {
        if (event.code === 'ArrowLeft') {
          const left = this.minSliderLeft - (step * this.valToPixelFactor);
          if (this.rangeSlider) this.setZipperBorder(left, 'min', this.minSlider.nativeElement.offsetWidth);
          const value = this.pixToVal(this.min, left);
          if (!this.pIsSpreadCorrect(value, this.range[1])) {
            return;
          }
          if (value >= this.min) {
            this.range[0] = this.minLimit ?
              this.stepper(value) >= this.minLimit ? this.stepper(value) : this.minLimit : this.stepper(value);
            this.minSliderLeft = this.valToPixel(this.range[0]);
            this.minSliderInitialLeft = this.minSliderLeft;

          }
        }
        else if (event.code === 'ArrowRight') {
          const left = this.minSliderLeft + (step * this.valToPixelFactor);
          if (this.rangeSlider) {
            this.setZipperBorder(left, 'min', this.minSlider.nativeElement.offsetWidth);
          }
          const value = this.pixToVal(this.min, left);
          if (!this.pIsSpreadCorrect(value, this.range[1])) {
            return;
          }
          if (value <= this.range[1]) {
            this.range[0] = this.stepper(value);
            this.minSliderLeft = this.valToPixel(this.range[0]);
            this.minSliderInitialLeft = this.minSliderLeft;
          }
        }
      }
      else if (this.maxSliderClicked) {
        if (event.code === 'ArrowLeft') {
          const left = this.maxSliderLeft - (step * this.valToPixelFactor);
          if (this.rangeSlider) {
            this.setZipperBorder(left, 'max', this.maxSlider.nativeElement.offsetWidth);
          }
          const value = this.pixToVal(this.min, left);
          if (!this.pIsSpreadCorrect(this.range[0], value)) {
            return;
          }
          if (value >= this.range[0]) {
            this.range[1] = this.stepper(value);
            this.maxSliderLeft = this.valToPixel(this.range[1]);
            this.maxSliderInitialLeft = this.maxSliderLeft;
          }
        }
        else if (event.code === 'ArrowRight') {
          const left = this.maxSliderLeft + (step * this.valToPixelFactor);
          if (this.rangeSlider) {
            this.setZipperBorder(left, 'max', this.maxSlider.nativeElement.offsetWidth);
          }
          const value = this.pixToVal(this.min, left);
          if (!this.pIsSpreadCorrect(this.range[0], value)) {
            return;
          }
          if (value <= this.max) {
            this.range[1] = this.maxLimit ?
              this.stepper(value) <= this.maxLimit ? this.stepper(value) : this.maxLimit : this.stepper(value);
            this.maxSliderLeft = this.valToPixel(this.range[1]);
            this.maxSliderInitialLeft = this.maxSliderLeft;
          }
        }
      }
      this.highlightDimensions();
    }
  }

  ngOnInit() {
    this.isRequired = this.ngControl.control?.hasValidator(Validators.required) === true;
  }

  ngAfterContentChecked() {
    this.getWidth();
  }

  ngDoCheck() {
    const changes = this.iterableDiffer.diff(this.range);
    if (changes) {
      if (this.rangeSlider) {
        this.onChangeCallback(this.range);
        this.onTouchedCallback(this.range);
        this.rangeChange.emit(this.range);
      } else if (!this.rangeSlider) {
        this.onChangeCallback(this.range[1]);
        this.onTouchedCallback(this.range[1]);
        this.rangeChange.emit(this.range[1]);
      }
    }
  }

  setZipperBorder(left: number, slider: string, sliderWidth: number) {
    if (slider === 'max') {
      if (((left - this.minSliderLeft) < sliderWidth) && !(this.minSlider.nativeElement.classList.contains('slider-zipper-layered'))) {
        this.renderer.addClass(this.maxSlider.nativeElement, 'slider-zipper-layered');
      } else {
        this.renderer.removeClass(this.maxSlider.nativeElement, 'slider-zipper-layered');
        this.renderer.removeClass(this.minSlider.nativeElement, 'slider-zipper-layered');
      }
    } else if (slider === 'min') {
      const difference = this.maxSliderLeft - left;
      if ((difference < sliderWidth) && !(this.maxSlider.nativeElement.classList.contains('slider-zipper-layered'))) {
        this.renderer.addClass(this.minSlider.nativeElement, 'slider-zipper-layered');
      } else {
        this.renderer.removeClass(this.minSlider.nativeElement, 'slider-zipper-layered');
        this.renderer.removeClass(this.maxSlider.nativeElement, 'slider-zipper-layered');
      }
    }
  };

  sethighlightClass(sliderHighlightClass: string) {
    if (sliderHighlightClass && this.sliderHighlight) {
      this.renderer.removeClass(this.sliderHighlight.nativeElement, 'slider-highlight-class');
      this.renderer.addClass(this.sliderHighlight.nativeElement, sliderHighlightClass);
    }
  }

  setBarClass(barClass: string) {
    if (barClass && this.bar) {
      this.renderer.removeClass(this.bar.nativeElement, 'slider-bar-class');
      this.renderer.addClass(this.bar.nativeElement, barClass);
    }
  }

  setSliderClass(sliderZipperClass: string) {
    if (sliderZipperClass && this.minSlider) {
      this.renderer.removeClass(this.minSlider.nativeElement, 'slider-zipper-class');
      this.renderer.addClass(this.minSlider.nativeElement, sliderZipperClass);
    }
    if (sliderZipperClass && this.maxSlider) {
      this.renderer.removeClass(this.maxSlider.nativeElement, 'slider-zipper-class');
      this.renderer.addClass(this.maxSlider.nativeElement, sliderZipperClass);
    }
  }

  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }

  writeValue(value: any): void {
    if (value) {
      if (this.rangeSlider) {
        value[0] = this.minLimit ? value[0] < this.minLimit ? this.minLimit : value[0] : value[0];
        value[0] = this.min > value[0] ? this.min : value[0];
        value[1] = this.maxLimit ? value[1] > this.maxLimit ? this.maxLimit : value[1] : value[1];
        value[1] = this.max < value[1] ? this.max : value[1];
        if (value[0] === null) {
          value[0] = this.minLimit ? this.minLimit : this.min;
        }
        else if (value[1] === null) {
          value[1] = this.maxLimit ? this.maxLimit : this.max;
        }
        else {
          if (this.range) {
            const prevRange = this.rangeCache.slice(0);
            if (value[0] > prevRange[1]) {
              value[0] = prevRange[1];
            }
            else if (value[0] < this.min) {
              value[0] = this.min;
            }
            else if (value[1] < prevRange[0]) {
              value[1] = prevRange[0];
            }
            else if (value[1] > this.max) {
              value[1] = this.max;
            }
          }
        }
        this.update(value);
      } else if (!this.rangeSlider) {
        const rangeValue = [this.minLimit || this.min || 0, value];
        if (rangeValue[1] === null) {
          rangeValue[1] = this.max;
        } else {
          if (this.range) {
            const prevRange = this.rangeCache.slice(0);
            if (rangeValue[1] < prevRange[0]) {
              rangeValue[1] = prevRange[0];
            }
            else if (this.maxLimit && rangeValue[1] > this.maxLimit) {
              rangeValue[1] = this.maxLimit;
            }
            else if (this.minLimit && rangeValue[1] < this.minLimit) {
              rangeValue[1] = this.minLimit;
            }
            else if (rangeValue[1] > this.max) {
              rangeValue[1] = this.max;
            }
          }
        }
        this.update(rangeValue[1]);
      }
    }
  }

  update(range: number[] | number) {
    if (this.rangeSlider) {
      this.range = [...range as number[]];
      this.rangeCache = (JSON.parse(JSON.stringify(range)));
    } else if (!this.rangeSlider) {
      this.range = [this.minLimit || this.min || 0, range as number];
      this.rangeCache = (JSON.parse(JSON.stringify([this.minLimit || this.min || 0, range])));
    }
    this.setBarClass(this.barClass);
    this.setSliderClass(this.sliderClass);
    this.sethighlightClass(this.highlightClass);
    this.getWidth();
  }

  minTouched(event: any) {
    const evt = event.changedTouches[0];
    this.minMouseDown(evt);
  }

  maxTouched(event: any) {
    const evt = event.changedTouches[0];
    this.maxMouseDown(evt);
  }

  minMouseDown(event: any) {
    if (this.isDisabled) {
      return;
    }
    this.minSliderClicked = true;
    this.minSelected = true;
    this.maxSliderClicked = false;
    this.maxSelected = false;
    this.minSliderInitialLeft = event.target.offsetLeft;
    this.initialMinMouseX = event.clientX;
  }

  maxMouseDown(event: any) {
    if (this.isDisabled) {
      return;
    }
    this.maxSliderClicked = true;
    this.maxSelected = true;
    this.minSliderClicked = false;
    this.minSelected = false;
    this.maxSliderInitialLeft = event.target.offsetLeft;
    this.initialMaxMouseX = event.clientX;
  }

  registerOnChange(onChange: any) {
    this.onChangeCallback = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.registerOnTouched = onTouched;
  }

  validate(): any {
    return null;
  }

  getlength(num: number) {
    return String(num).match(/\d/g)?.length;
  }

  getWidth() {
    if (this.bar && (this.minSlider || this.maxSlider) && this.range && this.range[0] !== undefined) {
      if (this.minSlider) {
        this.sliderWidth = this.minSlider.nativeElement.offsetWidth;
        this.sliderHeight = this.minSlider.nativeElement.offsetHeight;
      } else if (this.maxSlider) {
        this.sliderWidth = this.maxSlider.nativeElement.offsetWidth;
        this.sliderHeight = this.maxSlider.nativeElement.offsetHeight;
      } else {
        return;
      }
      this.toolTipTop = -(this.sliderHeight - 2);
      this.barWidth = this.bar.nativeElement.offsetWidth;
      if (this.sliderWidth && this.barWidth) {
        this.rangeDiff = this.max - this.min;
        this.rangeInPixels = this.barWidth;
        if (this.barWidth && this.sliderWidth) {
          this.valToPixelFactor = ((this.rangeInPixels) / this.rangeDiff);
        }
        this.minSliderLeft = (this.range[0] - this.min) * this.valToPixelFactor;
        this.maxSliderLeft = (this.range[1] - this.min) * this.valToPixelFactor;
      }
      this.highlightDimensions();
      this.limitsDimensions();
    }
  }

  highlightDimensions() {
    const limitsLeft = this.valToPixel(this.minLimit || this.min);
    this.highlightLeft = this.rangeSlider ? this.minSliderLeft : limitsLeft;
    this.highlightWidth = this.maxSliderLeft - this.minSliderLeft;
    if (this.range[0] !== undefined) {
      this.minToolTipWidth = this.getlength(this.range[0]);
      const cond = this.minToolTipWidth! * 8 + this.minSliderLeft + 8;
      if (cond > this.maxSliderLeft && this.showTooltip && this.rangeSlider) {
        this.toolTip = false;
        this.combineToolTip = true;
        //@ts-ignore
        this.combineToolTipWidth = this.getlength(`${this.range[0]}-${this.range[1]}`)! * 8;
        const maxLeft = this.rangeInPixels - this.combineToolTipWidth;
        this.combineToolTipLeft = this.minSliderLeft < maxLeft ? this.minSliderLeft : maxLeft;
      }
      else {
        this.toolTip = true;
        this.combineToolTip = false;
      }
    }
  }

  limitsDimensions() {
    this.minLimitWidth = this.valToPixel(this.minLimit);
    this.maxLimitWidth = this.valToPixel(this.max - this.maxLimit);
  }

  clickedOnContainer(event: any) {
    if (event.target.id === 'container') {
      if (!this.rangeSlider) {
        if (event.offsetX > this.maxSliderLeft) {
          this.clickedOnBar(event);
        } else if (event.offsetX < this.maxSliderLeft) {
          this.clickedOnHighLight(event);
        }
      } else if (this.rangeSlider) {
        if ((event.offsetX < this.minSliderLeft) || (event.offsetX > this.maxSliderLeft)) {
          this.clickedOnBar(event);
        } else if (this.minSliderLeft < event.offsetX && event.offsetX < this.maxSliderLeft) {
          this.clickedOnHighLight(event);
        }
      }
    }
  }

  clickedOnBar(event: any) {
    this.minSelected = false;
    this.maxSelected = false;
    const targetId = event.target.id;
    const left = event.offsetX;
    if ((targetId === 'bar') || (targetId === 'container')) {
      if (left < this.minSliderLeft) {
        const value = this.pixToVal(this.min, left);
        if (this.rangeSlider) {
          this.setZipperBorder(left, 'min', this.minSlider.nativeElement.offsetWidth);
        }
        const finalVal = this.minLimit ? this.stepper(value) >= this.minLimit ? this.stepper(value) : this.minLimit : this.stepper(value);
        if (!this.pIsSpreadCorrect(value, this.range[1])) {
          return;
        }
        this.range[0] = finalVal <= this.min ? this.min : finalVal;
        this.minSliderLeft = this.valToPixel(this.range[0]);
      }
      else if (left > this.maxSliderLeft) {
        if (left >= (this.rangeInPixels) && !this.maxLimit) {
          if (!this.pIsSpreadCorrect(this.range[0], this.max)) {
            return;
          }
          this.maxSliderLeft = this.rangeInPixels;
          this.range[1] = this.max;
        }
        else {
          const value = this.pixToVal(this.min, left);
          if (this.rangeSlider) {
            this.setZipperBorder(left, 'max', this.maxSlider.nativeElement.offsetWidth);
          }
          if (!this.pIsSpreadCorrect(this.range[0], value)) {
            return;
          }
          this.range[1] = this.maxLimit ? this.stepper(value) <= this.maxLimit ? this.stepper(value) : this.maxLimit : this.stepper(value);
          this.maxSliderLeft = this.valToPixel(this.range[1]);
        }
      }
    }
    this.highlightDimensions();
  }

  clickedOnHighLight(event: any) {
    this.minSelected = false;
    this.maxSelected = false;
    const left = event.target.id === 'container' ? event.offsetX - this.minSliderLeft : event.offsetX;
    const cond = (this.highlightWidth / 2);
    if (this.rangeSlider) {
      if (left <= cond) {
        const orgLeft = this.minSliderLeft + left;
        const value = this.pixToVal(this.min, orgLeft);
        if (!this.pIsSpreadCorrect(value, this.range[1])) {
          return;
        }
        this.range[0] = this.minLimit ? this.stepper(value) >= this.minLimit ? this.stepper(value) : this.minLimit : this.stepper(value);
        this.minSliderLeft = this.valToPixel(this.range[0]);
        this.setZipperBorder(left, 'min', this.minSlider.nativeElement.offsetWidth);
      } else if (left > cond) {
        const orgLeft = this.minSliderLeft + left;
        const value = this.pixToVal(this.min, orgLeft);
        if (!this.pIsSpreadCorrect(this.range[0], value)) {
          return;
        }
        this.range[1] = this.minLimit ? this.stepper(value) >= this.minLimit ? this.stepper(value) : this.minLimit : this.stepper(value);
        this.maxSliderLeft = this.valToPixel(this.range[1]);
        this.setZipperBorder(orgLeft, 'max', this.maxSlider.nativeElement.offsetWidth);
      }
    } else {
      const value = this.pixToVal(this.min, left);
      if (!this.pIsSpreadCorrect(this.range[0], value)) {
        return;
      }
      this.range[1] = this.stepper(value);
      this.range[1] = this.minLimit ? this.stepper(value) >= this.minLimit ? this.stepper(value) : this.minLimit : this.stepper(value);
      this.maxSliderLeft = this.valToPixel(this.range[1]);
    }
    this.highlightDimensions();
  }

  pixToVal(min: number, left: number): number {
    const value = Number((min + left * (1 / this.valToPixelFactor)).toFixed(2));
    return value;
  }

  stepper(value: number): number {
    if (this.step && !this.decimalPlaces) {
      const fin = value - Math.floor(value);
      if (fin >= 0.5) {
        value = Math.ceil(value);
      }
      else {
        value = Math.floor(value);
      }
      const remainder = value % this.step;
      if (remainder === 0) {
        return value;
      }
      else {
        if (remainder >= (this.step / 2)) {
          value = value + (this.step - remainder);
        }
        else {
          value = value - remainder;
        }
      }
    }
    return value;
  }

  valToPixel(value: number): number {
    const pixel = this.valToPixelFactor * (value - this.min);
    return pixel;
  }

  private pIsSpreadCorrect(start: number, stop: number): boolean {
    if (this.minSpread > stop - start) {
      return false;
    }
    if (this.maxSpread < stop - start) {
      return false;
    }
    return true;
  }
}
