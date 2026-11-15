'use client';

import React, { useState } from 'react';
import {
  Project,
  UnitType,
  PlotType,
  ConstructionQuality,
  WallType,
  ConcreteGradePCC,
  ConcreteGradeRCC,
  FlooringType,
  WastageOption
} from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Hammer, ArrowRight, ArrowLeft, Check, FileText, Upload, AlertTriangle, ScanLine, Sparkles, CheckCircle2 } from 'lucide-react';
import { BlueprintAnalyzer, DrawingWithPreviews } from './BlueprintAnalyzer';
import { analyzeDrawing } from '../../lib/ai/blueprintAnalyzer';

interface DetectedRoomDetail {
  name: string;
  length?: number;
  width?: number;
  area?: number;
}

interface ProjectFormProps {
  initialData?: Project | null;
  onSubmit: (data: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, drawings?: DrawingWithPreviews[]) => void;
  isLoading?: boolean;
}

export function ProjectForm({ initialData, onSubmit, isLoading = false }: ProjectFormProps) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Blueprint Analyzer Optional State
  const [useBlueprint, setUseBlueprint] = useState(false);
  const [blueprintWarning, setBlueprintWarning] = useState(false);
  const [drawings, setDrawings] = useState<DrawingWithPreviews[]>([]);
  const [isAnalyzingBlueprint, setIsAnalyzingBlueprint] = useState(false);
  const [aiFilled, setAiFilled] = useState(false);
  const [detectedRoomsList, setDetectedRoomsList] = useState<DetectedRoomDetail[]>([]);

  // Plot Details State
  const [projectName, setProjectName] = useState(initialData?.projectName || '');
  const [country, setCountry] = useState(initialData?.country || 'India');
  const [plotLength, setPlotLength] = useState(initialData?.plotLength ? String(initialData.plotLength) : '');
  const [plotWidth, setPlotWidth] = useState(initialData?.plotWidth ? String(initialData.plotWidth) : '');
  const [unit, setUnit] = useState<UnitType>(initialData?.unit || 'Feet');
  const [plotType, setPlotType] = useState<PlotType>(initialData?.plotType || 'Residential');

  // Building Details State
  const [floors, setFloors] = useState(initialData?.floors ? String(initialData.floors) : '1');
  const [quality, setQuality] = useState<ConstructionQuality>(
    (initialData?.quality as any) === 'Basic' ? 'Economy' : (initialData?.quality as ConstructionQuality) || 'Standard'
  );
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms ? String(initialData.bedrooms) : '2');
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms ? String(initialData.bathrooms) : '2');
  const [kitchens, setKitchens] = useState(initialData?.kitchens ? String(initialData.kitchens) : '1');
  const [livingRooms, setLivingRooms] = useState(initialData?.livingRooms ? String(initialData.livingRooms) : '1');
  const [balconies, setBalconies] = useState(initialData?.balconies ? String(initialData.balconies) : '1');
  const [parkingRequired, setParkingRequired] = useState(initialData?.parkingRequired || false);

  // Technical Details State
  const [floorHeight, setFloorHeight] = useState(initialData?.floorHeight ? String(initialData.floorHeight) : '10');
  const [wallType, setWallType] = useState<WallType>(initialData?.wallType || 'Brick Masonry');
  const [pccGrade, setPccGrade] = useState<ConcreteGradePCC>(initialData?.pccGrade || 'M7.5');
  const [rccGrade, setRccGrade] = useState<ConcreteGradeRCC>(initialData?.rccGrade || 'M20');
  const [flooringType, setFlooringType] = useState<FlooringType>(initialData?.flooringType || 'Vitrified');
  const [wastageOption, setWastageOption] = useState<WastageOption>(initialData?.wastageOption || 5);

  const handleAnalyzeDrawings = async (currentDrawings: DrawingWithPreviews[]) => {
    if (!currentDrawings || currentDrawings.length === 0) return;
    setIsAnalyzingBlueprint(true);

    try {
      let bBedrooms = 0;
      let bBathrooms = 0;
      let bKitchens = 0;
      let bLivingRooms = 0;
      let bBalconies = 0;
      const detectedRooms: DetectedRoomDetail[] = [];

      const updatedDrawings = [...currentDrawings];

      for (let i = 0; i < updatedDrawings.length; i++) {
        const drawing = updatedDrawings[i];
        updatedDrawings[i] = { ...drawing, analysisStatus: 'analyzing' };
        setDrawings([...updatedDrawings]);

        const analysis = await analyzeDrawing({
          projectId: 'new-project',
          drawing,
          plotLengthFt: Number(plotLength) || 50,
          plotWidthFt: Number(plotWidth) || 30,
          floors: Number(floors) || 1,
          buildingType: plotType || 'Residential',
          imageBase64: drawing.fileDataUrl?.replace(/^data:image\/\w+;base64,/, ''),
          imageMimeType: drawing.fileType === 'pdf' ? undefined : (drawing.fileType === 'png' ? 'image/png' : 'image/jpeg'),
          allPageBase64: drawing.previewImages?.map(img => img.replace(/^data:image\/\w+;base64,/, '')),
        });

        updatedDrawings[i] = { ...updatedDrawings[i], analysisStatus: 'complete' };
        setDrawings([...updatedDrawings]);

        // Process detected room elements
        if (analysis && analysis.detectedElements) {
          const roomElements = analysis.detectedElements.filter(e => e.type === 'room');

          roomElements.forEach(r => {
            const labelLower = (r.label || '').toLowerCase();
            detectedRooms.push({
              name: r.label || 'Room',
              length: r.dimensions?.length,
              width: r.dimensions?.width,
              area: r.dimensions?.area || (r.dimensions?.length && r.dimensions?.width ? r.dimensions.length * r.dimensions.width : undefined),
            });

            if (labelLower.includes('bed') || labelLower.includes('room') && !labelLower.includes('living') && !labelLower.includes('bath') && !labelLower.includes('rest')) {
              bBedrooms++;
            } else if (labelLower.includes('bath') || labelLower.includes('toilet') || labelLower.includes('restroom') || labelLower.includes('ensuite') || labelLower.includes('wc')) {
              bBathrooms++;
            } else if (labelLower.includes('kitchen') || labelLower.includes('pantry')) {
              bKitchens++;
            } else if (labelLower.includes('living') || labelLower.includes('dining') || labelLower.includes('hall') || labelLower.includes('foyer')) {
              bLivingRooms++;
            } else if (labelLower.includes('balcony') || labelLower.includes('terrace') || labelLower.includes('verandah')) {
              bBalconies++;
            }
          });
        }

        // Auto-extract building dimensions if found
        if (analysis && analysis.extractedDimensions) {
          const dims = analysis.extractedDimensions;
          if (dims.floorHeight) setFloorHeight(String(dims.floorHeight));
          if (dims.wallThickness) {
            setWallType(dims.wallThickness <= 5 ? 'AAC Blocks' : 'Brick Masonry');
          }
        }
      }

      if (bBedrooms > 0) setBedrooms(String(bBedrooms));
      if (bBathrooms > 0) setBathrooms(String(bBathrooms));
      if (bKitchens > 0) setKitchens(String(bKitchens));
      if (bLivingRooms > 0) setLivingRooms(String(bLivingRooms));
      if (bBalconies > 0) setBalconies(String(bBalconies));

      if (detectedRooms.length > 0) {
        setDetectedRoomsList(detectedRooms);
        setAiFilled(true);
      }
    } catch (err) {
      console.error('Failed to analyze blueprint:', err);
    } finally {
      setIsAnalyzingBlueprint(false);
    }
  };

  const validateStep1 = () => {
    const tempErrors: Record<string, string> = {};
    if (!projectName.trim()) tempErrors.projectName = 'Project name is required';
    if (!plotLength || Number(plotLength) <= 0) tempErrors.plotLength = 'Length must be greater than 0';
    if (!plotWidth || Number(plotWidth) <= 0) tempErrors.plotWidth = 'Width must be greater than 0';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateStep2 = () => {
    const tempErrors: Record<string, string> = {};
    if (!floors || Number(floors) <= 0) tempErrors.floors = 'Floors must be at least 1';
    if (!floorHeight || Number(floorHeight) <= 0) tempErrors.floorHeight = 'Floor height must be greater than 0';
    if (Number(bedrooms) < 0) tempErrors.bedrooms = 'Invalid number of bedrooms';
    if (Number(bathrooms) < 0) tempErrors.bathrooms = 'Invalid number of bathrooms';
    if (Number(kitchens) < 0) tempErrors.kitchens = 'Invalid number of kitchens';
    if (Number(livingRooms) < 0) tempErrors.livingRooms = 'Invalid number of living rooms';
    if (Number(balconies) < 0) tempErrors.balconies = 'Invalid number of balconies';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        setErrors({});
      }
    } else if (step === 2) {
      setStep(3);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 || step === 2) {
      handleNext();
      return;
    }

    if (validateStep2()) {
      onSubmit({
        projectName,
        country,
        plotLength: Number(plotLength),
        plotWidth: Number(plotWidth),
        unit,
        plotType,
        floors: Number(floors),
        quality,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        kitchens: Number(kitchens),
        livingRooms: Number(livingRooms),
        balconies: Number(balconies),
        parkingRequired,
        floorHeight: Number(floorHeight),
        wallType,
        pccGrade,
        rccGrade,
        flooringType,
        wastageOption,
      }, drawings);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      {/* Visual step indicators */}
      <div className="h-1.5 w-full bg-slate-50 flex">
        <div
          className="h-full bg-slate-900 transition-all duration-500 ease-in-out"
          style={{ width: step === 1 ? '33.33%' : step === 2 ? '66.66%' : '100%' }}
        />
      </div>

      <CardHeader className="text-center pt-8">
        <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2.5">
          <Hammer className="h-6 w-6 text-amber-500" />
          <span>{initialData ? 'Edit Estimator Profile' : 'New Estimate Builder'}</span>
        </CardTitle>
        <CardDescription>
          {step === 1
            ? 'Step 1: Set up dimensions and parameters of the plot area'
            : step === 2
              ? 'Step 2: Upload or analyze architectural floor plan (Optional)'
              : 'Step 3: Define built spaces, construction quality, and technical parameters'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Step Tabs header */}
        <div className="flex justify-center items-center space-x-3 sm:space-x-4 mb-8 text-xs sm:text-sm">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center space-x-1.5 font-semibold ${step === 1 ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className={`h-6 w-6 rounded-full flex items-center justify-center border text-xs ${step === 1 ? 'bg-slate-950 text-white border-slate-950' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
              {step > 1 ? <Check className="h-3.5 w-3.5" /> : '1'}
            </span>
            <span>Plot Parameters</span>
          </button>

          <div className="h-px w-4 sm:w-6 bg-slate-200" />

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setStep(2);
            }}
            className={`flex items-center space-x-1.5 font-semibold ${step === 2
                ? 'text-slate-900'
                : step > 2
                  ? (useBlueprint ? 'text-slate-700 hover:text-slate-900' : 'text-rose-600 hover:text-rose-700')
                  : 'text-slate-400'
              }`}
          >
            <span className={`h-6 w-6 rounded-full flex items-center justify-center border text-xs ${step === 2
                ? 'bg-slate-950 text-white border-slate-950'
                : step > 2
                  ? (useBlueprint
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border-rose-200')
                  : 'bg-white text-slate-400 border-slate-200'
              }`}>
              {step > 2 ? (
                useBlueprint ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )
              ) : (
                '2'
              )}
            </span>
            <span className={step > 2 && !useBlueprint ? 'text-rose-600' : ''}>
              Blueprint Analyzer {step > 2 && !useBlueprint ? '(Skipped)' : ''}
            </span>
          </button>

          <div className="h-px w-4 sm:w-6 bg-slate-200" />

          {/* Step 3 */}
          <button
            type="button"
            disabled={step < 3}
            className={`flex items-center space-x-1.5 font-semibold ${step === 3 ? 'text-slate-900' : 'text-slate-400'}`}
          >
            <span className={`h-6 w-6 rounded-full flex items-center justify-center border text-xs ${step === 3 ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-400 border-slate-200'}`}>
              3
            </span>
            <span>Building Plan & Tech</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-5">
              {/* Project Name */}
              <div>
                <Input
                  label="Project / Client Name"
                  placeholder="e.g. Greenwood Luxury Villa"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  error={errors.projectName}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Length */}
                <Input
                  label={`Plot Length (${unit})`}
                  type="number"
                  placeholder="e.g. 50"
                  value={plotLength}
                  onChange={(e) => setPlotLength(e.target.value)}
                  error={errors.plotLength}
                  required
                />

                {/* Width */}
                <Input
                  label={`Plot Width (${unit})`}
                  type="number"
                  placeholder="e.g. 30"
                  value={plotWidth}
                  onChange={(e) => setPlotWidth(e.target.value)}
                  error={errors.plotWidth}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Dimension Unit */}
                <Select
                  label="Measurement Unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitType)}
                  options={[
                    { label: 'Feet (ft)', value: 'Feet' },
                    { label: 'Meter (m)', value: 'Meter' },
                  ]}
                />

                {/* Plot Type */}
                <Select
                  label="Plot Use Case"
                  value={plotType}
                  onChange={(e) => setPlotType(e.target.value as PlotType)}
                  options={[
                    { label: 'Residential', value: 'Residential' },
                    { label: 'Commercial', value: 'Commercial' },
                    { label: 'Mixed Use', value: 'Mixed Use' },
                  ]}
                />
              </div>

              {/* Step 1 Footer */}
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={handleNext} className="w-full sm:w-auto">
                  <span>Continue to Blueprint</span>
                  <ArrowRight className="ml-2.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="space-y-5">
              {/* Full Blueprint Analyzer Integration Step 2 */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600">
                      <ScanLine className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        Blueprint Analyzer
                        <span className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">Optional Step</span>
                      </h4>
                      <p className="text-xs text-slate-500">Upload architectural floor plan blueprints (PDF/Image) for automatic structural extraction.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <BlueprintAnalyzer
                    projectId="new-project"
                    drawings={drawings}
                    isAnalyzing={false}
                    onDrawingsChange={(newDrawings) => {
                      setDrawings(newDrawings);
                      if (newDrawings.length > 0) {
                        setUseBlueprint(true);
                        setBlueprintWarning(false);
                      }
                    }}
                    onAnalyzeAll={() => {}}
                  />
                </div>

                {drawings.length === 0 && !blueprintWarning && (
                  <button
                    type="button"
                    onClick={() => setBlueprintWarning(true)}
                    className="w-full text-xs text-slate-500 hover:text-slate-800 underline text-center block pt-2"
                  >
                    Skip Blueprint Upload
                  </button>
                )}

                {drawings.length === 0 && blueprintWarning && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 mt-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800 space-y-1.5">
                      <p className="font-medium leading-relaxed">
                        Skipping blueprint upload: material estimation will use standard parametric defaults based on your plot and building specs.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2 Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="w-full sm:w-auto order-last sm:order-first">
                  <ArrowLeft className="mr-2.5 h-4 w-4" />
                  <span>Back to Parameters</span>
                </Button>

                <Button type="button" onClick={handleNext} className="w-full sm:w-auto">
                  <span>Continue to Building Plan</span>
                  <ArrowRight className="ml-2.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Floors count */}
                <Input
                  label="Number of Floors"
                  type="number"
                  min="1"
                  max="10"
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  error={errors.floors}
                  required
                />

                {/* Construction Quality */}
                <Select
                  label="Construction Finish"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as ConstructionQuality)}
                  options={[
                    { label: 'Economy (Budget Grade)', value: 'Economy' },
                    { label: 'Standard (Medium Grade)', value: 'Standard' },
                    { label: 'Premium (High-End Finish)', value: 'Premium' },
                    { label: 'Luxury (Ultra-Premium)', value: 'Luxury' },
                  ]}
                />
              </div>

              <span className="text-2xs font-bold text-slate-400 tracking-wider uppercase block pt-2 border-b border-slate-50 pb-1">
                Technical Specifications
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label={`Floor Height (${unit === 'Meter' ? 'm' : 'ft'})`}
                  type="number"
                  value={floorHeight}
                  onChange={(e) => setFloorHeight(e.target.value)}
                  error={errors.floorHeight}
                  required
                />

                <Select
                  label="Wall Construction"
                  value={wallType}
                  onChange={(e) => setWallType(e.target.value as WallType)}
                  options={[
                    { label: 'Red Clay Bricks', value: 'Brick Masonry' },
                    { label: 'AAC Blocks', value: 'AAC Blocks' },
                    { label: 'Concrete Hollow Blocks', value: 'Hollow Blocks' },
                  ]}
                />

                <Select
                  label="Wastage Margin"
                  value={String(wastageOption)}
                  onChange={(e) => setWastageOption(Number(e.target.value) as WastageOption)}
                  options={[
                    { label: '5% Margin', value: '5' },
                    { label: '10% Margin', value: '10' },
                    { label: '15% Margin', value: '15' },
                  ]}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-b border-slate-100 pb-1.5">
                <span className="text-2xs font-bold text-slate-400 tracking-wider uppercase">
                  Room Layout Configuration
                </span>
                {aiFilled && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    Auto-Filled by AI Blueprint Analyzer
                  </span>
                )}
              </div>

              {aiFilled && detectedRoomsList.length > 0 && (
                <div className="p-3 bg-gradient-to-r from-amber-50/70 to-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      AI Detected {detectedRoomsList.length} Rooms &amp; Sizes from Blueprint:
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">Auto-populated below</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {detectedRoomsList.map((room, idx) => (
                      <div key={idx} className="bg-white/90 border border-slate-200/80 rounded-lg p-2 text-xs">
                        <p className="font-semibold text-slate-800 truncate" title={room.name}>{room.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {room.length && room.width ? `${room.length} ft × ${room.width} ft` : ''}
                          {room.area ? ` (${Math.round(room.area)} sq ft)` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Input
                  label="Bedrooms"
                  type="number"
                  min="0"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  error={errors.bedrooms}
                />
                <Input
                  label="Bathrooms"
                  type="number"
                  min="0"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  error={errors.bathrooms}
                />
                <Input
                  label="Kitchens"
                  type="number"
                  min="0"
                  value={kitchens}
                  onChange={(e) => setKitchens(e.target.value)}
                  error={errors.kitchens}
                />
                <Input
                  label="Living Rooms"
                  type="number"
                  min="0"
                  value={livingRooms}
                  onChange={(e) => setLivingRooms(e.target.value)}
                  error={errors.livingRooms}
                />
                <Input
                  label="Balconies"
                  type="number"
                  min="0"
                  value={balconies}
                  onChange={(e) => setBalconies(e.target.value)}
                  error={errors.balconies}
                />

                {/* Parking Requirement Toggle */}
                <div className="flex flex-col space-y-2.5 justify-center pl-2">
                  <span className="text-2xs font-semibold text-slate-700 tracking-wide uppercase">
                    Parking Space
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={parkingRequired}
                      onChange={(e) => setParkingRequired(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900" />
                    <span className="ml-3 text-xs font-semibold text-slate-600">
                      {parkingRequired ? 'Required' : 'None'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Step 2 Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-50 mt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="w-full sm:w-auto order-last sm:order-first">
                  <ArrowLeft className="mr-2.5 h-4 w-4" />
                  <span>Back to Parameters</span>
                </Button>

                <Button type="submit" loading={isLoading} className="w-full sm:w-auto">
                  <Check className="mr-2.5 h-4 w-4" />
                  <span>{initialData ? 'Update Estimate' : 'Generate Quantity Estimate'}</span>
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
